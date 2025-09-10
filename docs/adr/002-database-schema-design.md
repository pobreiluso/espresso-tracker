# ADR-002: Database Schema Design

## Status
Accepted

## Date
2025-09-10

## Context
The application needs to model the complete coffee journey from roaster to final brew, including:
- Coffee roasters and their background information
- Individual coffee products with origin details
- Physical coffee bags (purchases)
- Brewing sessions with detailed parameters
- AI analysis results for brews
- User preferences and settings

The schema must support both manual data entry and AI-extracted information while maintaining referential integrity and enabling efficient queries.

## Decision
We will implement a normalized relational schema with the following key decisions:

### Schema Structure
```sql
roasters → coffees → bags → brews
                           ↓
                     ai_analysis (embedded)
```

### Core Design Principles
1. **Normalization**: Separate concerns for roasters, coffees, bags, and brews
2. **Flexibility**: Support both manual entry and AI extraction
3. **Extensibility**: Easy to add new fields for AI analysis
4. **Performance**: Optimized for common query patterns

### Key Tables

#### Roasters Table
```sql
roasters (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT,
  website TEXT,
  description TEXT,
  founded_year INTEGER,
  specialty TEXT,
  roasting_style TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

#### Coffees Table
```sql
coffees (
  id UUID PRIMARY KEY,
  roaster_id UUID REFERENCES roasters(id),
  name TEXT NOT NULL,
  origin_country TEXT,
  region TEXT,
  farm TEXT,
  variety TEXT,
  process TEXT,
  altitude INTEGER,
  tasting_notes TEXT,
  cupping_score DECIMAL,
  certification TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

#### Bags Table
```sql
bags (
  id UUID PRIMARY KEY,
  coffee_id UUID REFERENCES coffees(id),
  user_id UUID,
  size_g INTEGER NOT NULL,
  price DECIMAL,
  roast_date DATE,
  open_date DATE,
  purchase_location TEXT,
  photo_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

#### Brews Table
```sql
brews (
  id UUID PRIMARY KEY,
  bag_id UUID REFERENCES bags(id),
  user_id UUID NOT NULL,
  method TEXT NOT NULL,
  dose_g DECIMAL NOT NULL,
  yield_g DECIMAL NOT NULL,
  time_s INTEGER NOT NULL,
  grind_setting TEXT,
  water_temp_c INTEGER,
  rating INTEGER CHECK (rating >= 1 AND rating <= 10),
  notes TEXT,
  brew_date TIMESTAMP,
  photo_url TEXT,
  
  -- AI Analysis Fields
  ai_analysis JSONB,
  extraction_quality TEXT,
  brewing_method_detected TEXT,
  visual_score DECIMAL,
  confidence_score DECIMAL,
  has_ai_analysis BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### AI Analysis Integration
- **JSONB Storage**: Complete AI analysis stored as JSONB for flexibility
- **Extracted Fields**: Key analysis results extracted to columns for queries
- **Backward Compatibility**: Nullable fields support brews without AI analysis

### Development Simplifications
- **RLS Disabled**: Row Level Security disabled for development ease
- **Foreign Key Constraints Relaxed**: Simplified for development workflow
- **Flexible Validation**: Loose constraints to accommodate various data sources

## Consequences

### Positive
- **Normalized Design**: Eliminates data duplication and maintains consistency
- **AI Integration**: Seamlessly stores both structured and unstructured AI results
- **Query Performance**: Optimized for common access patterns
- **Extensibility**: Easy to add new fields for future features
- **Development Friendly**: Simplified constraints for rapid development

### Negative
- **Complexity**: More complex than a flat schema
- **Query Overhead**: Joins required for complete data retrieval
- **Migration Complexity**: Schema changes require careful migration planning

### Trade-offs
- **Storage vs Query Speed**: JSONB provides flexibility at some query cost
- **Normalization vs Simplicity**: Chose normalization for data integrity
- **Development vs Production**: Relaxed constraints for easier development

## Implementation Details

### Common Query Patterns
```sql
-- Get brew with full coffee details
SELECT b.*, c.name as coffee_name, r.name as roaster_name
FROM brews b
JOIN bags bag ON b.bag_id = bag.id
JOIN coffees c ON bag.coffee_id = c.id
JOIN roasters r ON c.roaster_id = r.id
WHERE b.user_id = $1
ORDER BY b.brew_date DESC;
```

### AI Analysis Storage
```typescript
// JSONB structure for ai_analysis field
interface BrewAnalysis {
  extraction_analysis: {
    quality: string,
    confidence: number,
    scientific_reasoning: string
  },
  brewing_method: {
    detected_method: string,
    confidence: number
  },
  // ... additional analysis fields
}
```

### Indexing Strategy
- Primary keys (UUID) for all tables
- Foreign key indexes for joins
- Composite indexes on common query patterns
- JSONB indexes for AI analysis queries

## Alternatives Considered

1. **Flat Schema**: Single table approach - rejected due to data duplication
2. **Document Database**: MongoDB-style - rejected due to complex relationships
3. **Separate AI Analysis Table**: Normalized AI data - rejected due to complexity
4. **Event Sourcing**: Log-based approach - rejected due to implementation complexity

## Migration Strategy
- **Incremental Migrations**: Schema changes applied through Supabase migrations
- **Data Preservation**: Existing data preserved during schema updates
- **Rollback Support**: All migrations include rollback procedures

## Notes
This schema design balances normalization principles with practical development needs. The JSONB approach for AI analysis provides the flexibility needed for evolving AI capabilities while maintaining query performance for core application features.