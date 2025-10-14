// POST /api/ingest
// Ingest documents into Weaviate Cloud with tenant-specific collections
import { NextRequest, NextResponse } from 'next/server';
import weaviate, { WeaviateClient, configure } from 'weaviate-client';

// TODO: Future enhancement - Support additional document types (.pdf, .docx, .csv)
// Currently supports: .txt, .md files only

interface Document {
  filename: string;
  content: string;
  metadata?: string;
}

interface IngestRequest {
  tenantId: string;
  documents: Document[];
}

/**
 * Validates document file types
 * Currently only supports .txt and .md files
 */
function isValidFileType(filename: string): boolean {
  const validExtensions = ['.txt', '.md'];
  return validExtensions.some((ext) => filename.toLowerCase().endsWith(ext));
}

/**
 * Creates or retrieves a tenant-specific collection in Weaviate
 */
async function ensureCollection(client: WeaviateClient, tenantId: string): Promise<string> {
  const collectionName = `Documents_${tenantId}`;

  try {
    // Check if collection exists
    const exists = await client.collections.exists(collectionName);

    if (!exists) {
      // Create new collection with OpenAI vectorizer
      await client.collections.create({
        name: collectionName,
        vectorizers: configure.vectorizer.text2VecOpenAI({
          model: 'text-embedding-3-small',
        }),
        properties: [
          {
            name: 'content',
            dataType: 'text',
            description: 'Document content',
          },
          {
            name: 'title',
            dataType: 'text',
            description: 'Document title or heading',
          },
          {
            name: 'filename',
            dataType: 'text',
            description: 'Original filename',
          },
          {
            name: 'metadata',
            dataType: 'text',
            description: 'Additional metadata as JSON string',
          },
        ],
      });
      console.log(`Created collection: ${collectionName}`);
    }

    return collectionName;
  } catch (error) {
    console.error(`Error ensuring collection: ${error}`);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  let client: WeaviateClient | null = null;

  try {
    // Parse request body
    const body: IngestRequest = await request.json();
    const { tenantId, documents } = body;

    // Validate required fields
    if (!tenantId || !documents || !Array.isArray(documents)) {
      return NextResponse.json(
        {
          error: 'Invalid request. Required: tenantId (string) and documents (array)',
        },
        { status: 400 }
      );
    }

    // Validate environment variables
    if (!process.env.WEAVIATE_URL || !process.env.WEAVIATE_API_KEY || !process.env.OPENAI_API_KEY) {
      console.error('Missing required environment variables');
      return NextResponse.json(
        { error: 'Server configuration error. Please contact administrator.' },
        { status: 500 }
      );
    }

    // Filter valid document types
    const validDocuments = documents.filter((doc) => {
      if (!isValidFileType(doc.filename)) {
        console.warn(`Skipping unsupported file type: ${doc.filename}`);
        return false;
      }
      return true;
    });

    if (validDocuments.length === 0) {
      return NextResponse.json(
        {
          error: 'No valid documents to ingest. Only .txt and .md files are supported.',
        },
        { status: 400 }
      );
    }

    // Connect to Weaviate Cloud
    client = await weaviate.connectToWeaviateCloud(process.env.WEAVIATE_URL, {
      authCredentials: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY),
      headers: {
        'X-OpenAI-Api-Key': process.env.OPENAI_API_KEY,
      },
    });

    // Ensure collection exists
    const collectionName = await ensureCollection(client, tenantId);

    // Get collection
    const collection = client.collections.get(collectionName);

    // Prepare documents for insertion
    const dataObjects = validDocuments.map((doc) => ({
      content: doc.content,
      title: doc.filename.replace(/\.(txt|md)$/i, ''), // Remove extension for title
      filename: doc.filename,
      metadata: doc.metadata || JSON.stringify({ uploadedAt: new Date().toISOString() }),
    }));

    // Insert documents in batch
    const result = await collection.data.insertMany(dataObjects);

    // Check for errors
    const errors = result.errors;
    const hasErrors = Object.keys(errors).length > 0;

    if (hasErrors) {
      console.error('Insertion errors:', errors);
      return NextResponse.json(
        {
          success: true,
          message: 'Documents ingested with some errors',
          inserted: validDocuments.length - Object.keys(errors).length,
          total: validDocuments.length,
          errors: errors,
        },
        { status: 207 } // Multi-status
      );
    }

    // Success response
    return NextResponse.json(
      {
        success: true,
        message: 'Documents ingested successfully',
        inserted: validDocuments.length,
        skipped: documents.length - validDocuments.length,
        collectionName: collectionName,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error ingesting documents:', error);
    return NextResponse.json(
      {
        error: 'Failed to ingest documents',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    // Close client connection
    if (client) {
      try {
        await client.close();
      } catch (closeError) {
        console.error('Error closing client:', closeError);
      }
    }
  }
}
