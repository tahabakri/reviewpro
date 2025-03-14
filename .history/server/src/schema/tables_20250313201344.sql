-- Create UUIDs extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Businesses table
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    location TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Competitors table
CREATE TABLE IF NOT EXISTS competitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    platform VARCHAR(50) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    UNIQUE(business_id, platform, name)
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id UUID NOT NULL, -- Can reference either business or competitor
    rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    platform VARCHAR(50) NOT NULL,
    CONSTRAINT valid_entity_reference CHECK (
        EXISTS (
            SELECT 1 FROM businesses WHERE id = entity_id
            UNION
            SELECT 1 FROM competitors WHERE id = entity_id
        )
    )
);

-- Sentiments table
CREATE TABLE IF NOT EXISTS sentiments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    score DECIMAL(3,2) CHECK (score >= -1 AND score <= 1),
    analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Themes table
CREATE TABLE IF NOT EXISTS themes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    sentiment DECIMAL(3,2) CHECK (sentiment >= -1 AND sentiment <= 1),
    frequency INTEGER CHECK (frequency >= 0),
    UNIQUE(review_id, category)
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (
        type IN ('rating_threshold', 'review_volume', 'sentiment_drop', 'data_collection_error')
    ),
    conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
    active BOOLEAN NOT NULL DEFAULT true
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_competitors_business_id ON competitors(business_id);
CREATE INDEX IF NOT EXISTS idx_reviews_entity_id ON reviews(entity_id);
CREATE INDEX IF NOT EXISTS idx_reviews_platform ON reviews(platform);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_sentiments_review_id ON sentiments(review_id);
CREATE INDEX IF NOT EXISTS idx_themes_review_id ON themes(review_id);
CREATE INDEX IF NOT EXISTS idx_alerts_business_id ON alerts(business_id);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(type);

-- Full text search indexes
CREATE INDEX IF NOT EXISTS idx_reviews_content_search ON reviews USING GIN (to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS idx_competitors_name_search ON competitors USING GIN (to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_businesses_name_search ON businesses USING GIN (to_tsvector('english', name));