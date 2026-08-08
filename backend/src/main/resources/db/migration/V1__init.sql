
    create table artifact_metadata (
        created_at timestamp(6) with time zone,
        size_bytes bigint not null,
        id uuid not null,
        publish_history_id uuid not null unique,
        build_hash varchar(255) not null,
        checksum varchar(255) not null,
        primary key (id)
    );

    create table assets (
        height_px integer,
        width_px integer,
        created_at timestamp(6) not null,
        size_bytes bigint not null,
        updated_at timestamp(6),
        version bigint,
        id uuid not null,
        workspace_id uuid not null,
        status varchar(20) not null check (status in ('ACTIVE','PROCESSING','FAILED','DELETED')),
        content_type varchar(100) not null,
        filename varchar(255) not null,
        storage_key varchar(255) not null unique,
        url varchar(255) not null,
        primary key (id)
    );

    create table cache_metadata (
        artifact_metadata_id uuid not null unique,
        id uuid not null,
        cache_headers TEXT,
        immutable_assets TEXT,
        invalidation_paths TEXT,
        primary key (id)
    );

    create table components (
        order_index integer not null,
        created_at timestamp(6),
        updated_at timestamp(6),
        version bigint,
        id uuid not null,
        page_id uuid not null,
        parent_id uuid,
        type varchar(50) not null check (type in ('CONTAINER','TEXT','IMAGE','BUTTON')),
        props jsonb,
        primary key (id)
    );

    create table deployments (
        completed_at timestamp(6) with time zone,
        deployed_by_id bigint not null,
        expires_at timestamp(6) with time zone,
        started_at timestamp(6) with time zone,
        artifact_metadata_id uuid not null,
        id uuid not null,
        project_id uuid not null,
        website_version_id uuid not null,
        message TEXT,
        status varchar(255) not null check (status in ('PENDING','DEPLOYING','ACTIVE','FAILED','ROLLED_BACK','EXPIRED')),
        type varchar(255) not null check (type in ('PREVIEW','PRODUCTION')),
        primary key (id)
    );

    create table domains (
        is_active boolean not null,
        is_custom boolean not null,
        created_at timestamp(6) with time zone,
        updated_at timestamp(6) with time zone,
        id uuid not null,
        project_id uuid not null,
        hostname varchar(255) not null unique,
        ssl_status varchar(255) not null check (ssl_status in ('PENDING','ISSUED','ACTIVE','FAILED','EXPIRED')),
        verification_status varchar(255) not null check (verification_status in ('PENDING','RECORD_CREATED','VERIFIED','FAILED')),
        primary key (id)
    );

    create table organization_invitations (
        accepted_at timestamp(6),
        created_at timestamp(6) not null,
        expires_at timestamp(6) not null,
        invited_by_id bigint not null,
        updated_at timestamp(6),
        version bigint not null,
        id uuid not null,
        organization_id uuid not null,
        role varchar(20) not null check (role in ('OWNER','ADMIN','MEMBER')),
        status varchar(20) not null check (status in ('PENDING','ACCEPTED','DECLINED','EXPIRED','CANCELLED')),
        token varchar(100) not null unique,
        email varchar(255) not null,
        primary key (id)
    );

    create table organization_members (
        active boolean not null,
        created_at timestamp(6) not null,
        invited_by_id bigint,
        joined_at timestamp(6) not null,
        updated_at timestamp(6),
        user_id bigint not null,
        version bigint not null,
        id uuid not null,
        organization_id uuid not null,
        role varchar(20) not null check (role in ('OWNER','ADMIN','MEMBER')),
        primary key (id),
        constraint uk_org_member_org_user unique (organization_id, user_id)
    );

    create table organizations (
        created_at timestamp(6) not null,
        created_by_id bigint not null,
        updated_at timestamp(6),
        version bigint not null,
        id uuid not null,
        slug varchar(100) not null unique,
        name varchar(120) not null,
        description varchar(500),
        logo_url varchar(500),
        primary key (id)
    );

    create table pages (
        is_home_page boolean not null,
        created_at timestamp(6),
        updated_at timestamp(6),
        version bigint,
        id uuid not null,
        project_id uuid not null,
        description varchar(1000),
        name varchar(255) not null,
        slug varchar(255) not null,
        status varchar(255) not null check (status in ('DRAFT','PUBLISHED')),
        title varchar(255),
        primary key (id),
        unique (project_id, slug)
    );

    create table projects (
        created_at timestamp(6),
        updated_at timestamp(6),
        version bigint,
        id uuid not null,
        workspace_id uuid not null,
        description varchar(1000),
        custom_domain varchar(255),
        name varchar(255) not null,
        slug varchar(255) not null,
        status varchar(255) not null check (status in ('DRAFT','PUBLISHED','ARCHIVED')),
        primary key (id),
        unique (workspace_id, slug)
    );

    create table publish_histories (
        author_id bigint not null,
        published_at timestamp(6) with time zone not null,
        id uuid not null,
        website_version_id uuid not null,
        message TEXT,
        result varchar(255) not null check (result in ('SUCCESS','FAILED')),
        primary key (id)
    );

    create table publish_jobs (
        progress integer not null,
        completed_at timestamp(6) with time zone,
        started_at timestamp(6) with time zone,
        triggered_by_id bigint not null,
        id uuid not null,
        website_version_id uuid not null,
        error_message TEXT,
        status varchar(255) not null check (status in ('QUEUED','BUILDING','VALIDATING','PACKAGING','DEPLOYING','SUCCESS','FAILED')),
        primary key (id)
    );

    create table roles (
        id bigint generated by default as identity,
        name varchar(50) not null unique check (name in ('ROLE_USER','ROLE_ADMIN')),
        primary key (id)
    );

    create table user_roles (
        role_id bigint not null,
        user_id bigint not null,
        primary key (role_id, user_id)
    );

    create table users (
        account_non_expired boolean not null,
        account_non_locked boolean not null,
        credentials_non_expired boolean not null,
        enabled boolean not null,
        created_at timestamp(6) not null,
        id bigint generated by default as identity,
        updated_at timestamp(6),
        first_name varchar(100) not null,
        last_name varchar(100) not null,
        email varchar(255) not null unique,
        password varchar(255) not null,
        primary key (id)
    );

    create table website_versions (
        version_number integer not null,
        created_at timestamp(6) with time zone,
        created_by_id bigint not null,
        updated_at timestamp(6) with time zone,
        version bigint,
        id uuid not null,
        project_id uuid not null,
        status varchar(255) not null check (status in ('DRAFT','PREVIEW','PUBLISHED','ARCHIVED')),
        primary key (id)
    );

    create table workspaces (
        archived boolean not null,
        color varchar(7),
        created_at timestamp(6) not null,
        updated_at timestamp(6),
        version bigint not null,
        workspace_key varchar(10) not null,
        id uuid not null,
        organization_id uuid not null,
        icon varchar(100),
        name varchar(120) not null,
        description varchar(500),
        primary key (id),
        constraint uk_workspace_org_key unique (organization_id, workspace_key)
    );

    create index idx_asset_workspace_id 
       on assets (workspace_id);

    create index idx_org_invitation_org_id 
       on organization_invitations (organization_id);

    create index idx_org_invitation_token 
       on organization_invitations (token);

    create index idx_org_invitation_email 
       on organization_invitations (email);

    create index idx_org_member_org_id 
       on organization_members (organization_id);

    create index idx_org_member_user_id 
       on organization_members (user_id);

    create index idx_organization_created_by 
       on organizations (created_by_id);

    create index idx_organization_slug 
       on organizations (slug);

    create index idx_workspace_organization_id 
       on workspaces (organization_id);

    alter table if exists artifact_metadata 
       add constraint FKc25b29jhsiapil4l5ias49yct 
       foreign key (publish_history_id) 
       references publish_histories;

    alter table if exists assets 
       add constraint FKkahesjc363eytnnpmd1852m3d 
       foreign key (workspace_id) 
       references workspaces;

    alter table if exists cache_metadata 
       add constraint FK1dv9u6x8dmmo0dugx9vn9btus 
       foreign key (artifact_metadata_id) 
       references artifact_metadata;

    alter table if exists components 
       add constraint FK5kjha0ux82brw3oqkj5yu3efw 
       foreign key (page_id) 
       references pages;

    alter table if exists components 
       add constraint FK2isbe5q1gdcux59sdvfpwtv4 
       foreign key (parent_id) 
       references components;

    alter table if exists deployments 
       add constraint FK2askgfing3ikohtr817a4j0j4 
       foreign key (artifact_metadata_id) 
       references artifact_metadata;

    alter table if exists deployments 
       add constraint FKjjgnyh3pux1m2xn8kku8s23ku 
       foreign key (deployed_by_id) 
       references users;

    alter table if exists deployments 
       add constraint FKo0oavubuau58vb0njxxaqdxxt 
       foreign key (project_id) 
       references projects;

    alter table if exists deployments 
       add constraint FKoktr14ioaloyk0y7w0pq1kraf 
       foreign key (website_version_id) 
       references website_versions;

    alter table if exists domains 
       add constraint FKn0wkgoyc5mwm256p8lria1v5q 
       foreign key (project_id) 
       references projects;

    alter table if exists organization_invitations 
       add constraint FKhxochfxch7kprhptornx7vhc5 
       foreign key (invited_by_id) 
       references users;

    alter table if exists organization_invitations 
       add constraint FKpt2hiwb0x73kxxm65yxabtvc 
       foreign key (organization_id) 
       references organizations;

    alter table if exists organization_members 
       add constraint FKect5w68p2326hevcb63uk5vl7 
       foreign key (invited_by_id) 
       references users;

    alter table if exists organization_members 
       add constraint FK7vpc2vd3jlfahlombjdc32mhe 
       foreign key (organization_id) 
       references organizations;

    alter table if exists organization_members 
       add constraint FK67edx4b35ogkpk3ghbhwand9i 
       foreign key (user_id) 
       references users;

    alter table if exists organizations 
       add constraint FK51qsnbkujkiojbknkcjovyt76 
       foreign key (created_by_id) 
       references users;

    alter table if exists pages 
       add constraint FK9ao2h9hn2vi6f653wg9wwlinv 
       foreign key (project_id) 
       references projects;

    alter table if exists projects 
       add constraint FKpc7qv7bnsq7dm17g0tb0a60of 
       foreign key (workspace_id) 
       references workspaces;

    alter table if exists publish_histories 
       add constraint FKn9475ipttvbr1qanijr56uls2 
       foreign key (author_id) 
       references users;

    alter table if exists publish_histories 
       add constraint FKqlpd1ti6pi9pys0wk1owx0qya 
       foreign key (website_version_id) 
       references website_versions;

    alter table if exists publish_jobs 
       add constraint FKd8htf9c21h3bskyi7r1gpijky 
       foreign key (triggered_by_id) 
       references users;

    alter table if exists publish_jobs 
       add constraint FKck8hs296ayqv3ekcrvsf219pi 
       foreign key (website_version_id) 
       references website_versions;

    alter table if exists user_roles 
       add constraint FKh8ciramu9cc9q3qcqiv4ue8a6 
       foreign key (role_id) 
       references roles;

    alter table if exists user_roles 
       add constraint FKhfh9dx7w3ubf1co1vdev94g3f 
       foreign key (user_id) 
       references users;

    alter table if exists website_versions 
       add constraint FKcgk67hi2low5u3u9l8b6tqio9 
       foreign key (created_by_id) 
       references users;

    alter table if exists website_versions 
       add constraint FK65cl7ao5ulrefsgaou1q8unc7 
       foreign key (project_id) 
       references projects;

    alter table if exists workspaces 
       add constraint FKh15noqge0y0cpp8t6f2dc56g0 
       foreign key (organization_id) 
       references organizations;
