DELETE FROM users_roles WHERE true;
DELETE FROM roles WHERE true;
DELETE FROM email_confirm_tokens WHERE TRUE;
DELETE FROM users WHERE true;

INSERT INTO roles (name) VALUES ('ROLE_USER');