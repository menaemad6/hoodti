import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/ui/glass-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { UserRole, useAuth } from "@/context/AuthContext";
import { useCurrentTenant } from "@/context/TenantContext";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Users as UsersIcon, ShieldCheck, Shield } from "lucide-react";

interface UserWithRole {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  role: UserRole;
  avatar?: string | null;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const currentTenant = useCurrentTenant();

  // Fetch users and their roles
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .eq('tenant_id', currentTenant.id);

        if (profilesError) throw profilesError;

        const usersWithRoles: UserWithRole[] = [];

        // For each profile, get their role
        for (const profile of profiles || []) {
          const { data: roleData } = await supabase.rpc('get_highest_role', {
            user_id: profile.id
          });

          usersWithRoles.push({
            id: profile.id,
            email: profile.email || '',
            name: profile.name,
            created_at: profile.created_at || '',
            role: roleData as UserRole,
            avatar: profile.avatar
          });
        }

        // Sort users by role importance
        const sortedUsers = usersWithRoles.sort((a, b) => {
          const roleOrder = { super_admin: 0, admin: 1, user: 2 };
          return roleOrder[a.role] - roleOrder[b.role];
        });

        setUsers(sortedUsers);
        setFilteredUsers(sortedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load users",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [currentTenant]);

  // Filter users based on search query
  useEffect(() => {
    const filtered = users.filter(user => 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-500';
      case 'admin':
        return 'bg-blue-500';
      default:
        return 'bg-green-500';
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      // Prevent users from changing their own role
      if (user?.id === userId) {
        toast({
          variant: "destructive",
          title: "Action not allowed",
          description: "You cannot modify your own role",
        });
        return;
      }

      // Use RPC to update the role, ensuring newRole is one of the valid enum values
      if (!['user', 'admin', 'super_admin'].includes(newRole)) {
        throw new Error('Invalid role type');
      }

      const { error: updateError } = await supabase.rpc('update_user_role', {
        p_user_id: userId,
        p_role: newRole
      });

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));

      toast({
        title: "Role updated",
        description: `User role has been updated to ${newRole}`,
      });
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update user role",
      });
    }
  };

  return (
    <ProtectedRoute requiredRole="super_admin">
      <Layout>
        <div className="space-y-6 mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-3xl font-bold">User Management</h1>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button asChild variant="outline" className="flex-1 sm:flex-none justify-center">
                <Link to="/admin">Dashboard</Link>
              </Button>
              <Button asChild className="flex-1 sm:flex-none justify-center">
                <Link to="/">Back to Store</Link>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <UsersIcon className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </GlassCard>

            <GlassCard className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.role === 'admin').length}
                </p>
              </div>
            </GlassCard>

            <GlassCard className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <Shield className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Super Admins</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.role === 'super_admin').length}
                </p>
              </div>
            </GlassCard>
          </div>

          <GlassCard>
            <div className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-semibold">All Users</h2>
                  <p className="text-sm text-muted-foreground">
                    Manage user roles and permissions
                  </p>
                </div>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <p>No users found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((rowUser) => (
                        <TableRow key={rowUser.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={rowUser.avatar || ''} />
                                <AvatarFallback>{getInitials(rowUser.name)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{rowUser.name || "Unnamed User"}</p>
                                <p className="text-sm text-muted-foreground">{rowUser.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={`${getRoleColor(rowUser.role)} text-white`}>
                                {rowUser.role}
                              </Badge>
                              <Select
                                defaultValue={rowUser.role}
                                onValueChange={(value) => 
                                  updateUserRole(rowUser.id, value as UserRole)
                                }
                                disabled={user?.id === rowUser.id}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">User</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="super_admin">Super Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(rowUser.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">Delete</Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the 
                                    user account and all associated data.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default UserManagement;
