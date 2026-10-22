"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { CalendarDays, Camera, Mail, Phone, Save, Trash, Upload } from "lucide-react";
import type { User } from "@/types";
import { describeError } from "@/lib/api/http";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";

interface ProfileFormProps {
  user: User;
  /** Fecha ya registrada en el perfil del backend, si existe. */
  birthDate?: string;
  onSave: (patch: { phone: string; birthDate: string; avatarUrl?: string }) => void | Promise<void>;
}

const MAX_PHOTO_SIDE = 400;

/** Reduce la imagen (lado máx. 400 px) y la devuelve como data-URL JPEG liviana. */
function resizeToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, MAX_PHOTO_SIDE / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));

      const context = canvas.getContext("2d");
      if (!context) return reject(new Error("canvas"));
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image"));
    };

    image.src = url;
  });
}

/** Formulario de perfil: teléfono, fecha de nacimiento y fotografía. */
export function ProfileForm({ user, birthDate: initialBirthDate, onSave }: ProfileFormProps) {
  const [phone, setPhone] = useState(user.phone);
  const [birthDate, setBirthDate] = useState(initialBirthDate ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [error, setError] = useState<string>();
  const [dateError, setDateError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPhone(user.phone);
    setAvatarUrl(user.avatarUrl);
  }, [user]);

  useEffect(() => {
    setBirthDate(initialBirthDate ?? "");
  }, [initialBirthDate]);

  const dirty =
    phone !== user.phone || avatarUrl !== user.avatarUrl || birthDate !== (initialBirthDate ?? "");

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen (JPG, PNG o WebP).");
      return;
    }
    setError(undefined);
    // La imagen se reduce y se guarda en el perfil como data-URL.
    resizeToDataUrl(file)
      .then(setAvatarUrl)
      .catch(() => setError("No se pudo leer la imagen. Prueba con otro archivo."));
    e.target.value = "";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^[+\d\s()-]{7,}$/.test(phone)) {
      setError("Ingresa un teléfono válido, ej. +57 300 123 4567.");
      return;
    }
    // El perfil del backend exige teléfono y fecha de nacimiento juntos.
    if (!birthDate) {
      setError(undefined);
      setDateError("Indica tu fecha de nacimiento para poder guardar el perfil.");
      return;
    }
    if (new Date(birthDate) >= new Date()) {
      setError(undefined);
      setDateError("La fecha de nacimiento debe estar en el pasado.");
      return;
    }

    setError(undefined);
    setDateError(undefined);
    setSaving(true);
    try {
      await onSave({ phone, birthDate, avatarUrl });
    } catch (caught) {
      setError(describeError(caught, "No se pudo guardar el perfil."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader title="Fotografía" description="Tu foto de álbum del equipo." icon={<Camera />} />
        <div className="flex flex-col items-center gap-4 p-6">
          <div className="relative">
            <Avatar name={user.name} src={avatarUrl} size="xl" className="size-32 text-3xl" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-1 right-1 flex size-9 items-center justify-center rounded-full bg-co-yellow text-zinc-950 shadow ring-4 ring-white dark:ring-zinc-950"
              aria-label="Cambiar fotografía"
            >
              <Camera className="size-4" />
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" leftIcon={<Upload className="size-3.5" />} onClick={() => fileRef.current?.click()}>
              Subir foto
            </Button>
            {avatarUrl && (
              <Button variant="ghost" size="sm" leftIcon={<Trash className="size-3.5" />} onClick={() => setAvatarUrl(undefined)}>
                Quitar
              </Button>
            )}
          </div>
          <p className="text-center text-xs text-zinc-500">JPG, PNG o WebP. Recomendado 400×400 px.</p>
        </div>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader
          title="Datos de contacto"
          description="Teléfono y fecha de nacimiento son editables desde tu perfil."
          icon={<Phone />}
        />
        <div className="grid gap-4 p-6 sm:grid-cols-2">
          <Input label="Nombre" value={user.name} disabled />
          <Input label="Correo electrónico" value={user.email} icon={<Mail />} disabled hint="Gestionado por el administrador." />
          <Input
            label="Teléfono"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            icon={<Phone />}
            placeholder="+57 300 123 4567"
            error={error}
          />
          <Input
            label="Fecha de nacimiento"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            icon={<CalendarDays />}
            error={dateError}
          />
        </div>
        <div className="flex justify-end gap-2 border-t border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <Button
            variant="secondary"
            disabled={!dirty || saving}
            onClick={() => {
              setPhone(user.phone);
              setBirthDate(initialBirthDate ?? "");
              setAvatarUrl(user.avatarUrl);
              setError(undefined);
              setDateError(undefined);
            }}
          >
            Descartar
          </Button>
          <Button type="submit" disabled={!dirty} loading={saving} leftIcon={<Save className="size-4" />}>
            Guardar perfil
          </Button>
        </div>
      </Card>
    </form>
  );
}
