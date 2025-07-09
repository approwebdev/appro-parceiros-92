import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Upload } from "lucide-react";
import { toast } from "sonner";

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
  
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: string, value: string) => {
    let processedValue = value;
    
    if (field === 'phone') {
      processedValue = formatPhoneNumber(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: processedValue }));
  };

  const handlePhotoUpload = async (file: File) => {
    if (!file) return;
    
    setIsUploading(true);
    try {
      // Criar um canvas para redimensionar a imagem em círculo
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const size = 200; // Tamanho da imagem circular
        canvas.width = size;
        canvas.height = size;
        
        if (ctx) {
          // Criar clip circular
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
          ctx.clip();
          
          // Calcular dimensões para centralizar a imagem
          const aspectRatio = img.width / img.height;
          let drawWidth = size;
          let drawHeight = size;
          let offsetX = 0;
          let offsetY = 0;
          
          if (aspectRatio > 1) {
            drawHeight = size / aspectRatio;
            offsetY = (size - drawHeight) / 2;
          } else {
            drawWidth = size * aspectRatio;
            offsetX = (size - drawWidth) / 2;
          }
          
          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
          
          // Converter para blob
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              setFormData(prev => ({ ...prev, photo_url: url }));
              toast.success("Foto atualizada com sucesso!");
            }
          }, 'image/png');
        }
        setIsUploading(false);
      };
      
      img.src = URL.createObjectURL(file);
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      toast.error("Erro ao processar a imagem");
      setIsUploading(false);
    }
  };

  const handleSubmit = () => {
    const cleanPhone = formData.phone.replace(/\D/g, '');
    
    onUpdate({
      ...formData,
      phone: cleanPhone
    });
    
    toast.success("Informações do salão atualizadas!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações do Salão</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Foto do Salão */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="w-32 h-32">
              <AvatarImage src={formData.photo_url || undefined} />
              <AvatarFallback className="text-2xl">
                {formData.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 hover:bg-primary/90 transition-colors"
            >
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handlePhotoUpload(file);
            }}
            className="hidden"
          />
          
          <p className="text-sm text-muted-foreground text-center">
            Clique na câmera para alterar a foto do salão
          </p>
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