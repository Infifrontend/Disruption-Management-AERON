
-- Document Repository schema for NLP document management

-- Table for storing uploaded documents
CREATE TABLE IF NOT EXISTS document_repository (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size BIGINT NOT NULL,
    content_base64 TEXT NOT NULL,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    uploaded_by VARCHAR(100) DEFAULT 'system',
    is_active BOOLEAN DEFAULT true,
    processing_status VARCHAR(50) DEFAULT 'pending',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_document_repository_name ON document_repository(name);
CREATE INDEX IF NOT EXISTS idx_document_repository_type ON document_repository(file_type);
CREATE INDEX IF NOT EXISTS idx_document_repository_status ON document_repository(processing_status);
CREATE INDEX IF NOT EXISTS idx_document_repository_active ON document_repository(is_active);
CREATE INDEX IF NOT EXISTS idx_document_repository_uploaded_by ON document_repository(uploaded_by);

-- Table for document processing logs
CREATE TABLE IF NOT EXISTS document_processing_logs (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES document_repository(id) ON DELETE CASCADE,
    processing_step VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    message TEXT,
    processing_time INTEGER, -- in milliseconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_document_processing_logs_document_id ON document_processing_logs(document_id);
CREATE INDEX IF NOT EXISTS idx_document_processing_logs_status ON document_processing_logs(status);
