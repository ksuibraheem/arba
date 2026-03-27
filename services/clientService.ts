/**
 * Client Service — خدمة إدارة العملاء
 * Firestore CRUD for ArbaClient collection
 */

import { db } from '../firebase/config';
import {
    collection, doc, setDoc, getDoc, getDocs,
    updateDoc, deleteDoc, query, where, orderBy,
    serverTimestamp, Timestamp
} from 'firebase/firestore';
import { ArbaClient, generateId } from './projectTypes';

const CLIENTS_COL = 'clients';

// =================== CRUD ===================

export async function createClient(data: Partial<ArbaClient>): Promise<string> {
    const id = data.id || generateId('cli');
    const client: ArbaClient = {
        id,
        ownerId: data.ownerId || '',
        clientType: data.clientType || 'individual',
        name: data.name || '',
        phone: data.phone || '',
        email: data.email || '',
        company: data.company,
        cr: data.cr,
        vat: data.vat,
        nationalId: data.nationalId,
        address: data.address,
        city: data.city,
        notes: data.notes,
        logoUrl: data.logoUrl,
        logoStoragePath: data.logoStoragePath,
        documents: data.documents || [],
        employees: data.employees || [],
        storageUsedBytes: data.storageUsedBytes || 0,
        projectIds: data.projectIds || [],
        totalValue: data.totalValue || 0,
        createdAt: serverTimestamp() as unknown as Timestamp,
        updatedAt: serverTimestamp() as unknown as Timestamp,
    };

    await setDoc(doc(db, CLIENTS_COL, id), client);
    return id;
}

export async function getClient(id: string): Promise<ArbaClient | null> {
    const snap = await getDoc(doc(db, CLIENTS_COL, id));
    return snap.exists() ? ({ ...(snap.data() as Record<string, any>), id: snap.id } as ArbaClient) : null;
}

export async function updateClient(id: string, updates: Partial<ArbaClient>): Promise<void> {
    await updateDoc(doc(db, CLIENTS_COL, id), {
        ...updates,
        updatedAt: serverTimestamp(),
    });
}

export async function deleteClient(id: string): Promise<void> {
    await deleteDoc(doc(db, CLIENTS_COL, id));
}

// =================== QUERIES ===================

export async function getAllClients(ownerId?: string): Promise<ArbaClient[]> {
    let q;
    if (ownerId) {
        q = query(
            collection(db, CLIENTS_COL),
            where('ownerId', '==', ownerId),
            orderBy('createdAt', 'desc')
        );
    } else {
        q = query(
            collection(db, CLIENTS_COL),
            orderBy('createdAt', 'desc')
        );
    }
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ ...(d.data() as Record<string, any>), id: d.id } as ArbaClient));
}

export async function searchClients(searchTerm: string): Promise<ArbaClient[]> {
    // Firestore doesn't support full-text search natively
    // We fetch all and filter client-side (acceptable for small datasets)
    const all = await getAllClients();
    const term = searchTerm.toLowerCase();
    return all.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.phone.includes(term) ||
        c.email.toLowerCase().includes(term) ||
        (c.company || '').toLowerCase().includes(term)
    );
}

// =================== PROJECT LINKING ===================

export async function linkProjectToClient(clientId: string, projectId: string): Promise<void> {
    const client = await getClient(clientId);
    if (!client) return;

    const projectIds = [...new Set([...client.projectIds, projectId])];
    await updateClient(clientId, { projectIds });
}

export async function unlinkProjectFromClient(clientId: string, projectId: string): Promise<void> {
    const client = await getClient(clientId);
    if (!client) return;

    const projectIds = client.projectIds.filter(id => id !== projectId);
    await updateClient(clientId, { projectIds });
}

export async function updateClientTotalValue(clientId: string, totalValue: number): Promise<void> {
    await updateClient(clientId, { totalValue });
}
