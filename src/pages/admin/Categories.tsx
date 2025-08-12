import { getCategories } from "@/integrations/supabase/categories.service";
import { useCurrentTenant } from "@/context/TenantContext";
import { useEffect, useState } from "react";
import { Button, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { Edit, Delete } from "lucide-react";
import SEOHead from "@/components/seo/SEOHead";
import { useSEOConfig } from "@/lib/seo-config";

const AdminCategories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentTenant = useCurrentTenant();
  const seoConfig = useSEOConfig('adminCategories');

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const categoriesData = await getCategories(currentTenant.id);
        setCategories(categoriesData.map(cat => ({ ...cat, image: Array.isArray(cat.image) ? cat.image[0] : cat.image })));
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, [currentTenant]);

  if (isLoading) {
    return (
      <>
        <SEOHead {...seoConfig} />
        <Typography>Loading categories...</Typography>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SEOHead {...seoConfig} />
        <Typography color="error">{error}</Typography>
      </>
    );
  }

  if (categories.length === 0) {
    return (
      <div>
        <SEOHead {...seoConfig} />
        <Typography variant="h6">No categories found for this tenant.</Typography>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/admin/categories/create"
        >
          Add New Category
        </Button>
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    // Implement delete logic here
  };

  return (
    <div>
      <SEOHead {...seoConfig} />
      <Typography variant="h4" gutterBottom>
        Categories
      </Typography>
      <Button
        variant="contained"
        color="primary"
        component={Link}
        to="/admin/categories/create"
      >
        Add New Category
      </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell>{category.name}</TableCell>
              <TableCell>{category.description}</TableCell>
              <TableCell>
                <Button
                  variant="outlined"
                  color="primary"
                  component={Link}
                  to={`/admin/categories/${category.id}/edit`}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => handleDelete(category.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminCategories;