export default function AuthInput({ name, value, onChange, type = 'text' }) {
    return (
        <div>
            <label htmlFor={name}>{name}</label>
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                required
            />
        </div>
    );
}