import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  UserCircle,
  Phone,
  Mail,
  Plus,
  MoreVertical,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { Contractor, ContractorContact } from "@/config/settingsConfig";

interface ContractorContactsCardProps {
  contractor: Contractor;
}

export const ContractorContactsCard = ({
  contractor,
}: ContractorContactsCardProps) => {
  const [contacts, setContacts] = useState<ContractorContact[]>(contractor.contacts || []);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newContact, setNewContact] = useState<Partial<ContractorContact>>({
    name: "",
    position: "",
    phone: "",
    email: "",
  });

  const handleAddContact = () => {
    if (!newContact.name?.trim()) {
      toast.error("Введіть ім'я контактної особи");
      return;
    }

    const contact: ContractorContact = {
      id: `ct-new-${Date.now()}`,
      name: newContact.name.trim(),
      position: newContact.position?.trim(),
      phone: newContact.phone?.trim(),
      email: newContact.email?.trim(),
      isPrimary: contacts.length === 0,
    };

    setContacts([...contacts, contact]);
    setNewContact({ name: "", position: "", phone: "", email: "" });
    setIsAddingContact(false);
    toast.success("Контактну особу додано");
  };

  const handleCancelAddContact = () => {
    setNewContact({ name: "", position: "", phone: "", email: "" });
    setIsAddingContact(false);
  };

  const handleEditContact = (contactId: string) => {
    const contact = contacts.find((c) => c.id === contactId);
    if (contact) {
      setNewContact({
        name: contact.name,
        position: contact.position,
        phone: contact.phone,
        email: contact.email,
      });
      setContacts(contacts.filter((c) => c.id !== contactId));
      setIsAddingContact(true);
    }
  };

  const handleMakePrimary = (contactId: string) => {
    setContacts(
      contacts.map((c) => ({
        ...c,
        isPrimary: c.id === contactId,
      }))
    );
    toast.success("Основний контакт змінено");
  };

  const handleDeleteContact = (contactId: string) => {
    setContacts(contacts.filter((c) => c.id !== contactId));
    toast.success("Контакт видалено");
  };

  return (
    <Card className="hover:shadow-md transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <UserCircle className="h-4 w-4" />
            Контактні особи
            {contacts.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {contacts.length}
              </Badge>
            )}
          </CardTitle>
          {!isAddingContact && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAddingContact(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Додати
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Add Contact Form */}
          {isAddingContact && (
            <div className="p-3 rounded-lg border border-dashed bg-muted/30 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Ім'я *</Label>
                  <Input
                    placeholder="Петренко Олександр"
                    value={newContact.name || ""}
                    onChange={(e) =>
                      setNewContact((c) => ({ ...c, name: e.target.value }))
                    }
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Посада</Label>
                  <Input
                    placeholder="Директор"
                    value={newContact.position || ""}
                    onChange={(e) =>
                      setNewContact((c) => ({ ...c, position: e.target.value }))
                    }
                    className="h-9"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Телефон</Label>
                  <Input
                    placeholder="+380501234567"
                    value={newContact.phone || ""}
                    onChange={(e) =>
                      setNewContact((c) => ({ ...c, phone: e.target.value }))
                    }
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Email</Label>
                  <Input
                    placeholder="email@example.com"
                    value={newContact.email || ""}
                    onChange={(e) =>
                      setNewContact((c) => ({ ...c, email: e.target.value }))
                    }
                    className="h-9"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 justify-end pt-1">
                <Button variant="ghost" size="sm" onClick={handleCancelAddContact}>
                  Скасувати
                </Button>
                <Button size="sm" onClick={handleAddContact}>
                  Зберегти
                </Button>
              </div>
            </div>
          )}

          {/* Contact List */}
          {contacts.length > 0
            ? contacts.map((contact, index) => (
                <div
                  key={contact.id || index}
                  className="flex items-start justify-between p-3 rounded-lg border bg-muted/30"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{contact.name}</p>
                    {contact.position && (
                      <p className="text-xs text-muted-foreground">
                        {contact.position}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {contact.phone && (
                        <a
                          href={`tel:${contact.phone}`}
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          <Phone className="h-3 w-3" />
                          {contact.phone}
                        </a>
                      )}
                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          <Mail className="h-3 w-3" />
                          {contact.email}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {contact.isPrimary && (
                      <Badge variant="secondary" className="text-xs">
                        Основний
                      </Badge>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={() => handleEditContact(contact.id)}
                        >
                          <Pencil className="h-3.5 w-3.5 mr-2" />
                          Редагувати
                        </DropdownMenuItem>
                        {!contact.isPrimary && (
                          <DropdownMenuItem
                            onClick={() => handleMakePrimary(contact.id)}
                          >
                            <Star className="h-3.5 w-3.5 mr-2" />
                            Зробити основним
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteContact(contact.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          Видалити
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            : !isAddingContact && (
                <p className="text-sm text-muted-foreground text-center py-3">
                  Немає контактних осіб
                </p>
              )}
        </div>
      </CardContent>
    </Card>
  );
};
