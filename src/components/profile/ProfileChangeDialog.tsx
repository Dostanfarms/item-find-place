
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PhotoUploadField from '@/components/PhotoUploadField';

interface ProfileChangeDialogProps {
  open: boolean;
  onClose: () => void;
  mode: 'photo' | 'password';
}

const ProfileChangeDialog: React.FC<ProfileChangeDialogProps> = ({
  open,
  onClose,
  mode
}) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(currentUser?.profile_photo || '');
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handlePhotoUpdate = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('employees')
        .update({ profile_photo: profilePhoto })
        .eq('id', currentUser.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile photo updated successfully"
      });
      onClose();
    } catch (error) {
      console.error('Error updating photo:', error);
      toast({
        title: "Error",
        description: "Failed to update profile photo",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!currentUser) return;
    
    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (passwords.new.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Verify current password
      const { data: employee } = await supabase
        .from('employees')
        .select('password')
        .eq('id', currentUser.id)
        .eq('password', passwords.current)
        .single();

      if (!employee) {
        toast({
          title: "Error",
          description: "Current password is incorrect",
          variant: "destructive"
        });
        return;
      }

      // Update password
      const { error } = await supabase
        .from('employees')
        .update({ password: passwords.new })
        .eq('id', currentUser.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password updated successfully"
      });
      onClose();
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'photo' ? 'Change Profile Photo' : 'Change Password'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {mode === 'photo' ? (
            <div className="space-y-4">
              <PhotoUploadField
                value={profilePhoto}
                onChange={setProfilePhoto}
                label="Profile Photo"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handlePhotoUpdate} disabled={loading}>
                  {loading ? 'Updating...' : 'Update Photo'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={passwords.current}
                  onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwords.new}
                  onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handlePasswordUpdate} disabled={loading}>
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileChangeDialog;
