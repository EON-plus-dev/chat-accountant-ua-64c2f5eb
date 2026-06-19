import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, User, Mail, Phone, MapPin, Pencil, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import EmailChangeDialog from "./EmailChangeDialog";

const PersonalDataSection = () => {
  const [formData, setFormData] = useState({
    firstName: "Олександр",
    lastName: "Іваненко",
    email: "oleksandr@example.com",
    phone: "+380 67 123 4567",
    country: "Україна",
    city: "Київ",
  });

  const [initialData] = useState(formData);
  const [showEmailDialog, setShowEmailDialog] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    toast.success("Зміни збережено (демо)");
  };

  const handleCancel = () => {
    setFormData(initialData);
    toast.info("Зміни скасовано");
  };

  const handleEmailChanged = (newEmail: string) => {
    setFormData(prev => ({ ...prev, email: newEmail }));
    toast.success("Email успішно змінено");
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData);

  return (
    <div className="space-y-4">
      {/* Compact Inline Avatar Row */}
      <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
        <Avatar className="w-11 h-11">
          <AvatarImage src="" />
          <AvatarFallback className="bg-primary/10 text-primary text-sm">
            <User className="w-5 h-5" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {formData.firstName} {formData.lastName}
          </p>
          <p className="text-xs text-muted-foreground truncate">{formData.email}</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
          <Camera className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Фото</span>
        </Button>
      </div>

      {/* Contact Data Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          <User className="w-3.5 h-3.5" />
          Особисті дані
        </div>
        
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="firstName" className="text-sm">Ім'я</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName" className="text-sm">Прізвище</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Contact Info Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          <Mail className="w-3.5 h-3.5" />
          Контакти
        </div>

        <div className="space-y-3">
          {/* Email with change button */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm">Email</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                value={formData.email}
                readOnly
                className="bg-muted/30 cursor-default"
              />
              <Button 
                variant="outline" 
                size="icon"
                className="shrink-0"
                onClick={() => setShowEmailDialog(true)}
                title="Змінити email"
              >
                <Pencil className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Зміна email потребує підтвердження
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-sm">Телефон</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Email Change Dialog */}
      <EmailChangeDialog
        open={showEmailDialog}
        onOpenChange={setShowEmailDialog}
        currentEmail={formData.email}
        onEmailChanged={handleEmailChanged}
      />

      {/* Location Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          <MapPin className="w-3.5 h-3.5" />
          Розташування
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="country" className="text-sm">Країна</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => handleChange("country", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="city" className="text-sm">Місто</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => handleChange("city", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Sticky Action Buttons */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t -mx-4 px-4 py-3 mt-4 md:static md:bg-transparent md:border-0 md:mx-0 md:px-0 md:py-0">
        <div className="flex items-center gap-2 justify-end">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleCancel}
            disabled={!hasChanges}
          >
            Скасувати
          </Button>
          <Button 
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges}
          >
            Зберегти
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PersonalDataSection;
