import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AuthorFieldsProps {
  name: string;
  email: string;
  social: string;
  onChange: (field: string, value: string) => void;
}

export const AuthorFields = ({ name, email, social, onChange }: AuthorFieldsProps) => {
  return (
    <>
      <div className="space-y-2 w-full">
        <Label htmlFor="name" className="after:content-['*'] after:ml-0.5 after:text-red-500">
          Your full name
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => onChange('name', e.target.value)}
          required
          className="w-full"
        />
      </div>

      <div className="space-y-2 w-full">
        <Label htmlFor="email" className="after:content-['*'] after:ml-0.5 after:text-red-500">
          Your email (only for me)
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => onChange('email', e.target.value)}
          required
          className="w-full"
        />
      </div>

      <div className="space-y-2 w-full">
        <Label htmlFor="social">Your social link (e.g. LinkedIn)</Label>
        <Input
          id="social"
          value={social}
          onChange={(e) => onChange('social', e.target.value)}
          className="w-full"
        />
      </div>
    </>
  );
};