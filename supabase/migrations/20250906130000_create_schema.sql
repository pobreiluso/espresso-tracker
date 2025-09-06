-- Create roasters table
CREATE TABLE roasters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR NOT NULL,
    country VARCHAR,
    website VARCHAR,
    description TEXT,
    founded_year INTEGER,
    specialty VARCHAR, -- e.g. "Specialty Coffee", "Third Wave", "Single Origin"
    size_category VARCHAR, -- e.g. "Micro", "Small", "Medium", "Large"
    roasting_style VARCHAR, -- e.g. "Light", "Medium", "Dark", "Nordic"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Create coffees table  
CREATE TABLE coffees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    roaster_id UUID REFERENCES roasters(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR NOT NULL,
    origin_country VARCHAR,
    region VARCHAR,
    subregion VARCHAR, -- More specific area within region
    farm VARCHAR,
    producer VARCHAR, -- Producer/farmer name
    cooperative VARCHAR, -- Cooperative name if applicable
    variety VARCHAR,
    variety_details TEXT, -- More detailed variety information
    process VARCHAR,
    process_details TEXT, -- Detailed process description
    altitude INTEGER,
    altitude_range VARCHAR, -- e.g. "1200-1400m"
    harvest_season VARCHAR, -- e.g. "October-February"
    certification VARCHAR, -- e.g. "Organic, Fair Trade, Rainforest Alliance"
    cupping_score DECIMAL(3,1), -- SCA cupping score
    tasting_notes TEXT,
    flavor_profile JSON, -- Structured flavor data: acidity, body, sweetness, etc.
    coffee_story TEXT, -- Background story about the coffee/farm
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Create bags table
CREATE TABLE bags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    coffee_id UUID REFERENCES coffees(id) ON DELETE CASCADE NOT NULL,
    size_g INTEGER NOT NULL,
    price DECIMAL(10,2),
    roast_date DATE NOT NULL,
    open_date DATE,
    finish_date DATE,
    purchase_location VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Create brews table
CREATE TABLE brews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bag_id UUID REFERENCES bags(id) ON DELETE CASCADE NOT NULL,
    method VARCHAR NOT NULL CHECK (method IN ('espresso', 'v60', 'aeropress', 'chemex', 'kalita', 'frenchpress')),
    dose_g DECIMAL(4,1) NOT NULL CHECK (dose_g >= 5 AND dose_g <= 30),
    yield_g DECIMAL(5,1) NOT NULL,
    ratio DECIMAL(4,2) GENERATED ALWAYS AS (yield_g / dose_g) STORED,
    time_s INTEGER NOT NULL CHECK (time_s >= 5 AND time_s <= 90),
    grind_setting VARCHAR NOT NULL,
    water_temp_c INTEGER CHECK (water_temp_c BETWEEN 80 AND 100),
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 10),
    flavor_tags TEXT[], -- Array of flavor tags
    notes TEXT,
    brew_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Create user preferences table
CREATE TABLE user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    default_method VARCHAR DEFAULT 'v60' CHECK (default_method IN ('espresso', 'v60', 'aeropress', 'chemex', 'kalita', 'frenchpress')),
    units_temp VARCHAR DEFAULT 'celsius' CHECK (units_temp IN ('celsius', 'fahrenheit')),
    confirm_bag_finish BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) policies
ALTER TABLE roasters ENABLE ROW LEVEL SECURITY;
ALTER TABLE coffees ENABLE ROW LEVEL SECURITY;
ALTER TABLE bags ENABLE ROW LEVEL SECURITY;
ALTER TABLE brews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for roasters
CREATE POLICY "Users can view their own roasters" ON roasters 
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own roasters" ON roasters 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own roasters" ON roasters 
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own roasters" ON roasters 
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for coffees
CREATE POLICY "Users can view their own coffees" ON coffees 
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own coffees" ON coffees 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own coffees" ON coffees 
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own coffees" ON coffees 
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for bags  
CREATE POLICY "Users can view their own bags" ON bags 
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own bags" ON bags 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bags" ON bags 
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bags" ON bags 
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for brews
CREATE POLICY "Users can view their own brews" ON brews 
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own brews" ON brews 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own brews" ON brews 
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own brews" ON brews 
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_preferences
CREATE POLICY "Users can view their own preferences" ON user_preferences 
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own preferences" ON user_preferences 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own preferences" ON user_preferences 
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own preferences" ON user_preferences 
    FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_roasters_user_id ON roasters(user_id);
CREATE INDEX idx_coffees_user_id ON coffees(user_id);
CREATE INDEX idx_coffees_roaster_id ON coffees(roaster_id);
CREATE INDEX idx_bags_user_id ON bags(user_id);
CREATE INDEX idx_bags_coffee_id ON bags(coffee_id);
CREATE INDEX idx_bags_open_date ON bags(open_date) WHERE finish_date IS NULL;
CREATE INDEX idx_brews_user_id ON brews(user_id);
CREATE INDEX idx_brews_bag_id ON brews(bag_id);
CREATE INDEX idx_brews_date ON brews(brew_date DESC);
CREATE INDEX idx_brews_rating ON brews(rating);
CREATE INDEX idx_brews_method ON brews(method);