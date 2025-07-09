import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Upload } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import { useToast } from "@/hooks/use-toast";

interface SalonData {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  instagram: string | null;
  photo_url: string | null;
}

interface SalonInfoFormProps {
  salon: SalonData;
  onUpdate: (data: Partial<SalonData>) => void;
}

const formatPhoneNumber = (value: string) => {
  // Remove tudo que não é número
  const cleaned = value.replace(/\D/g, '');
  
  // Aplica a máscara (99) 99999-9999
  if (cleaned.length <= 11) {
    return cleaned
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  }
  
  return value;
};

export function SalonInfoForm({ salon, onUpdate }: SalonInfoFormProps) {
  const [formData, setFormData] = useState({
    name: salon.name || '',
    phone: salon.phone || '',
    address: salon.address || '',
    instagram: salon.instagram || '',
    photo_url: salon.photo_url || ''
  });
  
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    let processedValue = value;
    
    if (field === 'phone') {
      processedValue = formatPhoneNumber(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: processedValue }));
  };


  const handleSubmit = () => {
    const cleanPhone = formData.phone.replace(/\D/g, '');
    
    onUpdate({
      ...formData,
      phone: cleanPhone
    });
    
    toast({
      title: "Sucesso!",
      description: "Informações do salão atualizadas!",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações do Salão</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Foto do Salão */}
        <div className="flex flex-col items-center space-y-4">
          <ImageUpload
            label="Foto do Salão"
            value={formData.photo_url}
            onChange={(url) => setFormData(prev => ({ ...prev, photo_url: url }))}
            bucket="treatment-images"
          />
        </div>

        {/* Formulário */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Salão</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Digite o nome do salão"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="(99) 99999-9999"
              maxLength={15}
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Endereço</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Digite o endereço completo"
              rows={3}
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              value={formData.instagram}
              onChange={(e) => handleInputChange('instagram', e.target.value)}
              placeholder="@seuinstagram"
            />
          </div>
        </div>
        
        <Button onClick={handleSubmit} className="w-full">
          <Upload className="w-4 h-4 mr-2" />
          Salvar Alterações
        </Button>
      </CardContent>
    </Card>
  );
}