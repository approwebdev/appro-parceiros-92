import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  bucket?: string;
  accept?: string;
  maxSize?: number; // em MB
}

export const ImageUpload = ({ 
  value, 
  onChange, 
  label = "Imagem",
  bucket = "treatment-images",
  accept = "image/*",
  maxSize = 5
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(value || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Security: Validate file type by MIME type and extension
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(file.type) || !allowedExtensions.includes(fileExtension)) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Apenas imagens JPG, PNG, WebP e GIF são permitidas",
        variant: "destructive",
      });
      return;
    }

    // Security: Check file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: `O arquivo deve ter no máximo ${maxSize}MB`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      // Security: Generate secure file name
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2);
      const fileName = `${timestamp}_${randomId}${fileExtension}`;

      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      setImageUrl(publicUrl);
      onChange(publicUrl);
      
      toast({
        title: "Upload realizado com sucesso!",
        description: "A imagem foi enviada com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro no upload",
        description: error.message || "Erro ao fazer upload da imagem",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUrlChange = (url: string) => {
    // Security: Basic URL validation and sanitization
    const trimmedUrl = url.trim();
    
    if (trimmedUrl && !trimmedUrl.match(/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i)) {
      toast({
        title: "URL inválida",
        description: "Por favor, insira uma URL válida de imagem",
        variant: "destructive",
      });
      return;
    }
    
    setImageUrl(trimmedUrl);
    onChange(trimmedUrl);
  };

  const clearImage = () => {
    setImageUrl('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">{label}</Label>
      
      {/* Preview da imagem */}
      {imageUrl && (
        <div className="relative">
          <img 
            src={imageUrl} 
            alt="Preview" 
            className="w-full h-32 object-cover rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={clearImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Opções de upload */}
      <div className="space-y-3">
        {/* Upload de arquivo */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Enviando...' : 'Enviar arquivo'}
          </Button>
        </div>

        {/* OU */}
        <div className="text-center text-sm text-gray-500">ou</div>

        {/* URL manual */}
        <div>
          <Input
            type="url"
            placeholder="Cole a URL da imagem aqui"
            value={imageUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};