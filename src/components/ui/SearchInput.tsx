import { Search } from "lucide-react";
import { Input } from "./Field";

export function SearchInput({
  value,
  onChange,
  placeholder = "Buscar…",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="w-full sm:max-w-xs">
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        icon={<Search />}
        aria-label={placeholder}
      />
    </div>
  );
}
