-- migrate:up
create schema if not exists extensions;
create extension if not exists "uuid-ossp" schema extensions;

-- Users table
create table users (
    id uuid primary key default extensions.uuid_generate_v4(),
    username varchar(32) unique not null,
    password text not null,
    created_at timestamptz default current_timestamp,
    updated_at timestamptz default current_timestamp,
    active boolean default true
);

-- Screening sessions (each time user runs the screener)
create table screenings (
    id uuid primary key default extensions.uuid_generate_v4(),
    user_id uuid references users(id) on delete set null,
    name varchar(255),
    price_min decimal(10,2),
    price_max decimal(10,2),
    filters jsonb default '{}',  -- store raw filter params
    status varchar(20) default 'running' check (status in ('running', 'completed', 'failed')),
    total_results int default 0,
    created_at timestamptz default current_timestamp,
    completed_at timestamptz
);

create index idx_screenings_user_id on screenings(user_id);
create index idx_screenings_created_at on screenings(created_at desc);

-- Pattern categories enum
create type pattern_type as enum ('starting_uptrend', 'consolidation', 'downtrend_reversal', 'unknown');
create type tier_type as enum ('buy', 'watch', 'skip');
create type news_status_type as enum ('pending', 'clean', 'red_flag');

-- Individual stock results from a screening
create table screening_results (
    id uuid primary key default extensions.uuid_generate_v4(),
    screening_id uuid not null references screenings(id) on delete cascade,
    ticker varchar(10) not null,

    -- Price & Volume
    price decimal(10,2),
    change_pct decimal(6,2),
    volume bigint,
    avg_volume bigint,
    market_cap decimal(15,2),  -- in millions

    -- Technical indicators
    rsi decimal(5,2),
    sma20_pct decimal(6,2),
    sma50_pct decimal(6,2),
    sma200_pct decimal(6,2),
    high_52w_pct decimal(6,2),
    low_52w_pct decimal(6,2),
    beta decimal(4,2),
    atr decimal(6,2),

    -- Ownership
    inst_own_pct decimal(6,2),
    inst_trans_pct decimal(6,2),
    insider_own_pct decimal(6,2),
    insider_trans_pct decimal(6,2),

    -- Short interest
    short_float_pct decimal(6,2),
    short_ratio decimal(5,2),

    -- Fundamentals
    profit_margin_pct decimal(6,2),
    pe_ratio decimal(8,2),
    debt_equity decimal(6,2),
    dividend_yield decimal(5,2),

    -- Classification
    pattern pattern_type default 'unknown',
    tier tier_type default 'watch',

    -- News check
    news_status news_status_type default 'pending',
    news_notes text,
    earnings_date date,

    -- Raw data backup
    raw_data jsonb,

    created_at timestamptz default current_timestamp
);

create index idx_screening_results_screening_id on screening_results(screening_id);
create index idx_screening_results_ticker on screening_results(ticker);
create index idx_screening_results_tier on screening_results(tier);
create index idx_screening_results_pattern on screening_results(pattern);

-- Trade setups (when user decides to enter a position)
create table trade_setups (
    id uuid primary key default extensions.uuid_generate_v4(),
    user_id uuid references users(id) on delete set null,
    screening_result_id uuid references screening_results(id) on delete set null,
    ticker varchar(10) not null,

    -- Entry plan
    entry_price decimal(10,2),
    stop_loss decimal(10,2),
    target_1 decimal(10,2),
    target_2 decimal(10,2),
    risk_reward decimal(4,2),
    position_size int,  -- number of shares

    -- SMC analysis data
    daily_bias varchar(20),  -- bullish/bearish/neutral
    order_block_low decimal(10,2),
    order_block_high decimal(10,2),
    fvg_low decimal(10,2),
    fvg_high decimal(10,2),
    liquidity_swept boolean default false,
    choch_confirmed boolean default false,

    -- Status tracking
    status varchar(20) default 'planned' check (status in ('planned', 'active', 'partial', 'closed', 'cancelled')),
    notes text,

    created_at timestamptz default current_timestamp,
    updated_at timestamptz default current_timestamp
);

create index idx_trade_setups_user_id on trade_setups(user_id);
create index idx_trade_setups_ticker on trade_setups(ticker);
create index idx_trade_setups_status on trade_setups(status);

-- Trade executions (actual fills)
create table trade_executions (
    id uuid primary key default extensions.uuid_generate_v4(),
    trade_setup_id uuid references trade_setups(id) on delete cascade,
    action varchar(10) not null check (action in ('buy', 'sell')),
    quantity int not null,
    price decimal(10,2) not null,
    fees decimal(8,2) default 0,
    executed_at timestamptz not null,
    notes text,
    created_at timestamptz default current_timestamp
);

create index idx_trade_executions_setup_id on trade_executions(trade_setup_id);

-- migrate:down
drop table if exists trade_executions;
drop table if exists trade_setups;
drop table if exists screening_results;
drop table if exists screenings;
drop table if exists users;
drop type if exists news_status_type;
drop type if exists tier_type;
drop type if exists pattern_type;
drop schema if exists extensions cascade;
