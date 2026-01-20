// Profile Settings Component - Photo upload, name change, occupation, password change
'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, User, Lock, Save, Eye, EyeOff, Check, X, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/lib/stores';
import { useTranslation } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import type { UserOccupation } from '@/lib/types';

const occupationOptions = (t: any): { value: UserOccupation; label: string; icon: string }[] => [
  { value: 'student', label: t('student'), icon: '🎓' },
  { value: 'freelancer', label: t('freelance'), icon: '💼' },
  { value: 'job_holder', label: t('job_holder'), icon: '👔' },
  { value: 'housewife', label: t('housewife'), icon: '🏠' },
  { value: 'other', label: t('other'), icon: '👤' },
];

export function ProfileSettings() {
  const { user, updateProfile, updatePassword } = useAuthStore();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Profile state
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [occupation, setOccupation] = useState<UserOccupation | undefined>(user?.occupation);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  
  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Handle file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      
      // Create image to resize
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 200; // Max width/height
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to compressed JPEG
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        setAvatar(compressedBase64);
      };
      img.src = base64;
    };
    reader.readAsDataURL(file);
  };

  // Save profile
  const handleSaveProfile = async () => {
    setProfileLoading(true);
    setProfileSuccess(false);
    
    try {
      updateProfile({ name: name.trim(), avatar, occupation });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } finally {
      setProfileLoading(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess(false);

    // Validation
    if (!oldPassword) {
      setPasswordError(t('currentPassword') + ' ' + t('noData').toLowerCase());
      return;
    }
    if (!newPassword) {
      setPasswordError(t('newPasswordLabel') + ' ' + t('noData').toLowerCase());
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError(t('passwordMinChar'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t('passMismatch'));
      return;
    }

    setPasswordLoading(true);
    try {
      const result = await updatePassword(oldPassword, newPassword);
      if (result.success) {
        setPasswordSuccess(true);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccess(false), 3000);
      } else {
        setPasswordError(result.error || 'Failed to change password');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {t('profileInfo')}
          </CardTitle>
          <CardDescription>
            {t('profileDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={cn(
                  'w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold',
                  'bg-primary/10 text-primary overflow-hidden border-4 border-primary/20'
                )}
              >
                {avatar ? (
                  <img src={avatar} alt={name} className="w-full h-full object-cover" />
                ) : (
                  getInitials(name || user.name)
                )}
              </motion.div>
              <Button
                size="icon"
                variant="secondary"
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full shadow-lg"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="w-4 h-4" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">{t('profilePhoto')}</p>
              <p className="text-xs text-muted-foreground">
                {t('photoInfo')}
              </p>
              {avatar && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-destructive"
                  onClick={() => setAvatar('')}
                >
                  <X className="w-4 h-4 mr-1" />
                  {t('removePhoto')}
                </Button>
              )}
            </div>
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name">{t('displayName')}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('enterName')}
            />
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              value={user.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">{t('emailInfo')}</p>
          </div>

          {/* Occupation Select */}
          <div className="space-y-2">
            <Label htmlFor="occupation" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              {t('occupation')}
            </Label>
            <Select value={occupation} onValueChange={(val: UserOccupation) => setOccupation(val)}>
              <SelectTrigger>
                <SelectValue placeholder={t('selectOccupation')} />
              </SelectTrigger>
              <SelectContent>
                {occupationOptions(t).map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span className="flex items-center gap-2">
                      <span>{opt.icon}</span>
                      <span>{opt.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-4">
            <Button 
              onClick={handleSaveProfile} 
              disabled={profileLoading}
              className="gap-2"
            >
              {profileSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  {t('saved')}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {profileLoading ? t('saving') : t('saveChanges')}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            {t('changePassword')}
          </CardTitle>
          <CardDescription>
            {t('passwordDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="oldPassword">{t('currentPassword')}</Label>
            <div className="relative">
              <Input
                id="oldPassword"
                type={showOldPassword ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder={t('currentPassword')}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowOldPassword(!showOldPassword)}
              >
                {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">{t('newPasswordLabel')}</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t('newPasswordLabel')}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('confirmNewPassword')}</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('confirmNewPassword')}
            />
          </div>

          {/* Error/Success Messages */}
          {passwordError && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-destructive"
            >
              {passwordError}
            </motion.p>
          )}
          {passwordSuccess && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-emerald-500"
            >
              {t('passChanged')}
            </motion.p>
          )}

          {/* Change Password Button */}
          <Button 
            onClick={handleChangePassword} 
            disabled={passwordLoading}
            variant="outline"
            className="gap-2"
          >
            {passwordLoading ? t('changing') : t('changePassword')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
