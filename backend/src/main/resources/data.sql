DELETE FROM users_roles WHERE true;
DELETE FROM roles WHERE true;
DELETE FROM email_confirm_tokens WHERE TRUE;
DELETE FROM avatars WHERE TRUE;
DELETE FROM user_reactions WHERE TRUE;
DELETE FROM reports WHERE TRUE;
DELETE FROM category_moderators WHERE TRUE;
DELETE FROM category_follows WHERE TRUE;
DELETE FROM categories WHERE TRUE;
DELETE FROM users WHERE true;

INSERT INTO roles (id, name) VALUES (1, 'ROLE_USER');
INSERT INTO roles (id, name) VALUES (2, 'ROLE_MODERATOR');

INSERT INTO users (
    id, public_id, username, display_name, email, password, description,
    posts_count, received_likes_count, received_dislikes_count, user_rating,
    registration_date, last_updated_at, is_email_verified
) VALUES (
    1, 'username', 'username', 'Display Name', 'user@example.com', 'password',
    'User description', 0, 0, 0, 1, NOW(), NOW(), true
);
INSERT INTO users (
    id, public_id, username, display_name, email, password, description,
    posts_count, received_likes_count, received_dislikes_count, user_rating,
    registration_date, last_updated_at, is_email_verified
) VALUES (
    2, 'username2', 'username2', 'Display Name', 'user2@example.com', 'password',
    'User description', 0, 0, 0, 1, NOW(), NOW(), true
);
INSERT INTO users (
    id, public_id, username, display_name, email, password, description,
    posts_count, received_likes_count, received_dislikes_count, user_rating,
    registration_date, last_updated_at, is_email_verified
) VALUES (
             3, 'username3', 'username3', 'Display Name', 'user3@example.com', 'password',
             'User description', 0, 0, 0, 1, NOW(), NOW(), true
         );

INSERT INTO users_roles (user_id, role_id)
VALUES (1, 1);

INSERT INTO users_roles (user_id, role_id)
VALUES (1, 2);

INSERT INTO users_roles (user_id, role_id)
VALUES (2, 1);

INSERT INTO users_roles (user_id, role_id)
VALUES (3, 1);

-- Initial Categories with Updated Banner and Icon URLs
INSERT INTO categories (name, slug, visibility, post_permission, description, banner_url, icon_url, followers_count, created_by, created_at, updated_at)
VALUES
    ('Technology', 'technology', 'PUBLIC', 'EVERYONE', 'All things tech-related.', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/codioful-formerly-gradienta-rKv4HduvzIE-unsplash.jpg', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/19444b9f-36ba-486a-bbc3-f98f1b88680c', 120, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- ID 1
    ('Gaming', 'gaming', 'PUBLIC', 'EVERYONE', 'Discussion on all types of games and platforms.', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/will-turner-KPCXuBucEps-unsplash.jpg', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/3075534d-7162-4a6b-846a-9b485c7dbe7a', 200, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- ID 2
    ('Science', 'science', 'PUBLIC', 'MODS_ONLY', 'For scientific discoveries, debates, and learning.', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/tianshu-liu-aqZ3UAjs_M4-unsplash.jpg', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/5929160_avatar_doctor_hospital_man_medical_icon.png', 90, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- ID 3 (creator changed to 1 as discussed previously)
    ('Programming', 'programming', 'PRIVATE', 'MODS_ONLY', 'A private space for developers.', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/codioful-formerly-gradienta-JehF_vdbUo4-unsplash.jpg', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/hannah-montez-2VslRz5G8fo-unsplash.jpg', 50, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP); -- ID 4

-- Corrected initial category_follows: creators (user 1 and 2) follow categories they created or mod
-- User 1 created Technology (1), Science (3), and Programming (4)
-- User 2 created Gaming (2)
INSERT INTO category_follows (category_id, user_id, followed_at, updated_at, notification_enabled) VALUES
                                                                                                       (1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true),  -- Technology by user 1 (creator)
                                                                                                       (2, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true),  -- Gaming by user 2 (creator)
                                                                                                       (3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true),  -- Science by user 1 (creator)
                                                                                                       (4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true);  -- Programming by user 1 (creator)

-- Corrected initial category_moderators: creators become owners and moderators of their categories
INSERT INTO category_moderators (user_id, category_id, role, assigned_at) VALUES
                                                                              (1, 1, 'OWNER', CURRENT_TIMESTAMP),      -- User 1 owns Technology
                                                                              (1, 1, 'MODERATOR', CURRENT_TIMESTAMP),  -- User 1 moderates Technology
                                                                              (2, 2, 'OWNER', CURRENT_TIMESTAMP),      -- User 2 owns Gaming
                                                                              (2, 2, 'MODERATOR', CURRENT_TIMESTAMP),  -- User 2 moderates Gaming
                                                                              (1, 3, 'OWNER', CURRENT_TIMESTAMP),      -- User 1 owns Science
                                                                              (1, 3, 'MODERATOR', CURRENT_TIMESTAMP),  -- User 1 moderates Science
                                                                              (1, 4, 'OWNER', CURRENT_TIMESTAMP),      -- User 1 owns Programming
                                                                              (1, 4, 'MODERATOR', CURRENT_TIMESTAMP);  -- User 1 moderates Programming


-- Adding 8 More Categories (IDs 5 through 12) - Banner/Icon URLs for these remain as previously generated
INSERT INTO categories (name, slug, visibility, post_permission, description, banner_url, icon_url, followers_count, created_by, created_at, updated_at)
VALUES
    ('Art', 'art', 'PUBLIC', 'EVERYONE', 'Discussing various forms of art and creativity.', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/hannah-montez-05KFkDsxDjk-unsplash.jpg', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/5929141_avatar_dizziness_man_sick_icon.png', 150, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- ID 5
    ('Music', 'music', 'PUBLIC', 'EVERYONE', 'For lovers of all genres of music.', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/codioful-formerly-gradienta-JehF_vdbUo4-unsplash.jpg', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/19444b9f-36ba-486a-bbc3-f98f1b88680c', 180, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- ID 6
    ('Movies & TV', 'movies-tv', 'PUBLIC', 'EVERYONE', 'Talk about the latest films and television shows.', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/lucas-k-wQLAGv4_OYs-unsplash.jpg', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/3075534d-7162-4a6b-846a-9b485c7dbe7a', 220, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- ID 7
    ('Books', 'books', 'PUBLIC', 'EVERYONE', 'Discuss your favorite books and authors.', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/pexels-magda-ehlers-pexels-960137.jpg', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/5929160_avatar_doctor_hospital_man_medical_icon.png', 110, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- ID 8
    ('Food & Cooking', 'food-cooking', 'PUBLIC', 'EVERYONE', 'Share recipes, tips, and food experiences.', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/a127eaa2-0dc1-4045-b44d-849413f0b849', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/will-turner-KPCXuBucEps-unsplash.jpg', 190, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- ID 9
    ('Travel', 'travel', 'PUBLIC', 'EVERYONE', 'Share travel stories, tips, and destinations.', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/tianshu-liu-aqZ3UAjs_M4-unsplash.jpg', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/hannah-montez-2VslRz5G8fo-unsplash.jpg', 160, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- ID 10
    ('Sports', 'sports', 'PUBLIC', 'EVERYONE', 'Discuss all kinds of sports.', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/steve-doig-gVNENglHe0g-unsplash.jpg', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/codioful-formerly-gradienta-rKv4HduvzIE-unsplash.jpg', 250, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- ID 11
    ('Health & Fitness', 'health-fitness', 'PRIVATE', 'MODS_ONLY', 'A private space for health enthusiasts.', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/codioful-formerly-gradienta-rKv4HduvzIE-unsplash.jpg', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/lucas-k-wQLAGv4_OYs-unsplash.jpg', 80, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP); -- ID 12

-- Add category_follows entries for the creator of each new category
INSERT INTO category_follows (category_id, user_id, followed_at, updated_at, notification_enabled) VALUES
                                                                                                       (5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true),  -- Art by user 2
                                                                                                       (6, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true),  -- Music by user 1
                                                                                                       (7, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true),  -- Movies & TV by user 2
                                                                                                       (8, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true),  -- Books by user 1
                                                                                                       (9, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true),  -- Food & Cooking by user 2
                                                                                                       (10, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true), -- Travel by user 1
                                                                                                       (11, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true), -- Sports by user 2
                                                                                                       (12, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true); -- Health & Fitness by user 1

-- Add category_moderators entries for the creator of each new category (OWNER and MODERATOR roles)
INSERT INTO category_moderators (user_id, category_id, role, assigned_at) VALUES
                                                                              (2, 5, 'OWNER', CURRENT_TIMESTAMP),      -- User 2 owns Art
                                                                              (2, 5, 'MODERATOR', CURRENT_TIMESTAMP),  -- User 2 moderates Art
                                                                              (1, 6, 'OWNER', CURRENT_TIMESTAMP),      -- User 1 owns Music
                                                                              (1, 6, 'MODERATOR', CURRENT_TIMESTAMP),  -- User 1 moderates Music
                                                                              (2, 7, 'OWNER', CURRENT_TIMESTAMP),      -- User 2 owns Movies & TV
                                                                              (2, 7, 'MODERATOR', CURRENT_TIMESTAMP),  -- User 2 moderates Movies & TV
                                                                              (1, 8, 'OWNER', CURRENT_TIMESTAMP),      -- User 1 owns Books
                                                                              (1, 8, 'MODERATOR', CURRENT_TIMESTAMP),  -- User 1 moderates Books
                                                                              (2, 9, 'OWNER', CURRENT_TIMESTAMP),      -- User 2 owns Food & Cooking
                                                                              (2, 9, 'MODERATOR', CURRENT_TIMESTAMP),  -- User 2 moderates Food & Cooking
                                                                              (1, 10, 'OWNER', CURRENT_TIMESTAMP),     -- User 1 owns Travel
                                                                              (1, 10, 'MODERATOR', CURRENT_TIMESTAMP), -- User 1 moderates Travel
                                                                              (2, 11, 'OWNER', CURRENT_TIMESTAMP),     -- User 2 owns Sports
                                                                              (2, 11, 'MODERATOR', CURRENT_TIMESTAMP), -- User 2 moderates Sports
                                                                              (1, 12, 'OWNER', CURRENT_TIMESTAMP),     -- User 1 owns Health & Fitness
                                                                              (1, 12, 'MODERATOR', CURRENT_TIMESTAMP); -- User 1 moderates Health & Fitness