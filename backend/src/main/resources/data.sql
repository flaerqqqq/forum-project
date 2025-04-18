DELETE FROM users_roles WHERE true;
DELETE FROM roles WHERE true;
DELETE FROM email_confirm_tokens WHERE TRUE;
DELETE FROM avatars WHERE TRUE;
DELETE FROM user_reactions WHERE TRUE;
DELETE FROM users WHERE true;

INSERT INTO roles (id, name) VALUES (1, 'ROLE_USER');

INSERT INTO users (
    id, public_id, username, display_name, email, password, description,
    posts_count, received_likes_count, received_dislikes_count, user_rating,
    registration_date, last_updated_at, is_email_verified
) VALUES (
    99, 'username', 'username', 'Display Name', 'user@example.com', 'password',
    'User description', 0, 0, 0, 1, NOW(), NOW(), true
);
INSERT INTO users (
    id, public_id, username, display_name, email, password, description,
    posts_count, received_likes_count, received_dislikes_count, user_rating,
    registration_date, last_updated_at, is_email_verified
) VALUES (
    100, 'username2', 'username2', 'Display Name', 'user2@example.com', 'password',
    'User description', 0, 0, 0, 1, NOW(), NOW(), true
);

INSERT INTO users_roles (user_id, role_id)
VALUES (99, 1);

INSERT INTO users_roles (user_id, role_id)
VALUES (100, 1);