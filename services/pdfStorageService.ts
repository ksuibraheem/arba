/**
 * PDF Storage Service — خدمة تخزين ملفات PDF
 * Upload PDFs to Firebase Storage + link to project
 */

import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import app from '../firebase/config';
import { linkQuoteToProject } from './projectService';
import { ArbaQuote, generateQuoteNumber } from './projectTypes';
import { serverTimestamp, Timestamp } from 'firebase/firestore';

const storage = getStorage(app);

// =================== UPLOAD ===================

export interface PDFUploadResult {
    success: boolean;
    quoteId?: string;
    downloadUrl?: string;
    storagePath?: string;
    error?: string;
}

/**
 * Upload a PDF blob to Firebase Storage and link it to a project.
 */
export async function uploadPDFToStorage(
    blob: Blob,
    projectId: string,
    userId: string,
    userName: string,
    finalPrice: number,
    totalItems: number,
    version: number = 1,
    quoteNumber?: string
): Promise<PDFUploadResult> {
    try {
        const qn = quoteNumber || generateQuoteNumber();
        const storagePath = `projects/${projectId}/quotes/${qn}.pdf`;
        const storageRef = ref(storage, storagePath);

        // Upload
        await uploadBytes(storageRef, blob, {
            contentType: 'application/pdf',
            customMetadata: {
                projectId,
                quoteNumber: qn,
                generatedBy: userId,
                version: String(version),
            },
        });

        // Get download URL
        const downloadUrl = await getDownloadURL(storageRef);

        // Link to project in Firestore
        const quoteData: Omit<ArbaQuote, 'id'> = {
            projectId,
            version,
            quoteNumber: qn,
            pdfUrl: downloadUrl,
            pdfStoragePath: storagePath,
            fileSize: blob.size,
            totalItems,
            finalPrice,
            generatedBy: userId,
            generatedByName: userName,
            generatedAt: serverTimestamp() as unknown as Timestamp,
        };

        const quoteId = await linkQuoteToProject(projectId, quoteData);

        return {
            success: true,
            quoteId,
            downloadUrl,
            storagePath,
        };
    } catch (err: any) {
        console.error('PDF Storage Error:', err);
        return {
            success: false,
            error: err?.message || String(err),
        };
    }
}

/**
 * Get download URL for an existing PDF.
 */
export async function getPDFDownloadUrl(storagePath: string): Promise<string | null> {
    try {
        const storageRef = ref(storage, storagePath);
        return await getDownloadURL(storageRef);
    } catch {
        return null;
    }
}
