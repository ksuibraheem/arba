/**
 * Document Service — خدمة إدارة وثائق العملاء
 * Firebase Storage upload/download/delete for client documents and logos
 */

import { storage, db } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ClientDocument, DocumentType, generateId } from './projectTypes';

// =================== FILE UPLOAD ===================

/**
 * Upload a client document file to Firebase Storage
 * Path: clients/{clientId}/documents/{docId}_{fileName}
 */
export async function uploadClientFile(
    clientId: string,
    file: File,
    docType: DocumentType,
    docId?: string
): Promise<{ fileUrl: string; storagePath: string; fileName: string; fileSize: number }> {
    const id = docId || generateId();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `clients/${clientId}/documents/${id}_${safeName}`;
    const storageRef = ref(storage, storagePath);

    await uploadBytes(storageRef, file, {
        contentType: file.type,
        customMetadata: {
            clientId,
            docType,
            originalName: file.name,
        },
    });

    const fileUrl = await getDownloadURL(storageRef);

    return {
        fileUrl,
        storagePath,
        fileName: file.name,
        fileSize: file.size,
    };
}

/**
 * Upload client logo
 * Path: clients/{clientId}/logo/{fileName}
 */
export async function uploadClientLogo(
    clientId: string,
    file: File
): Promise<{ logoUrl: string; logoStoragePath: string }> {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `clients/${clientId}/logo/${safeName}`;
    const storageRef = ref(storage, storagePath);

    await uploadBytes(storageRef, file, {
        contentType: file.type,
        customMetadata: { clientId, type: 'logo' },
    });

    const logoUrl = await getDownloadURL(storageRef);
    return { logoUrl, logoStoragePath: storagePath };
}

// =================== FILE DELETE ===================

/**
 * Delete a file from Firebase Storage
 */
export async function deleteFile(storagePath: string): Promise<void> {
    try {
        const storageRef = ref(storage, storagePath);
        await deleteObject(storageRef);
    } catch (err: any) {
        // Ignore "object-not-found" — file was already deleted
        if (err?.code !== 'storage/object-not-found') {
            throw err;
        }
    }
}

// =================== DOCUMENT MANAGEMENT ===================

/**
 * Add or update a document in the client's documents array
 */
export async function saveClientDocument(
    clientId: string,
    currentDocs: ClientDocument[],
    newDoc: ClientDocument
): Promise<ClientDocument[]> {
    const existing = currentDocs.findIndex(d => d.id === newDoc.id);
    let updatedDocs: ClientDocument[];

    if (existing >= 0) {
        // Update existing
        updatedDocs = [...currentDocs];
        updatedDocs[existing] = { ...updatedDocs[existing], ...newDoc };
    } else {
        // Add new
        updatedDocs = [...currentDocs, newDoc];
    }

    // Persist to Firestore
    await updateDoc(doc(db, 'clients', clientId), {
        documents: updatedDocs,
        updatedAt: serverTimestamp(),
    });

    return updatedDocs;
}

/**
 * Remove a document from client's documents array
 * Also deletes the file from Storage if storagePath exists
 */
export async function removeClientDocument(
    clientId: string,
    currentDocs: ClientDocument[],
    docId: string
): Promise<ClientDocument[]> {
    const docToDelete = currentDocs.find(d => d.id === docId);

    // Delete file from Storage
    if (docToDelete?.storagePath) {
        await deleteFile(docToDelete.storagePath);
    }

    const updatedDocs = currentDocs.filter(d => d.id !== docId);

    await updateDoc(doc(db, 'clients', clientId), {
        documents: updatedDocs,
        updatedAt: serverTimestamp(),
    });

    return updatedDocs;
}

/**
 * Update client logo (upload new + delete old)
 */
export async function updateClientLogo(
    clientId: string,
    file: File,
    oldLogoPath?: string
): Promise<{ logoUrl: string; logoStoragePath: string }> {
    // Delete old logo if exists
    if (oldLogoPath) {
        await deleteFile(oldLogoPath);
    }

    // Upload new
    const result = await uploadClientLogo(clientId, file);

    // Update client record
    await updateDoc(doc(db, 'clients', clientId), {
        logoUrl: result.logoUrl,
        logoStoragePath: result.logoStoragePath,
        updatedAt: serverTimestamp(),
    });

    return result;
}

/**
 * Remove client logo
 */
export async function removeClientLogo(
    clientId: string,
    logoStoragePath: string
): Promise<void> {
    await deleteFile(logoStoragePath);
    await updateDoc(doc(db, 'clients', clientId), {
        logoUrl: null,
        logoStoragePath: null,
        updatedAt: serverTimestamp(),
    });
}
