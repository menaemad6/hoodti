
import React from 'react';
import Layout from '@/components/layout/Layout';
import { useNavigate } from 'react-router-dom';
import GlassCard from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface AccountLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  backLink?: string;
  backLinkText?: string;
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  children,
  title,
  description,
  backLink,
  backLinkText = 'Back'
}) => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <GlassCard className="p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold">{title}</h1>
              {description && (
                <p className="text-muted-foreground mt-1">{description}</p>
              )}
            </div>
            
            {backLink && (
              <Button 
                variant="outline" 
                onClick={() => navigate(backLink)}
                className="flex items-center rounded-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {backLinkText}
              </Button>
            )}
          </div>
          
          {children}
        </GlassCard>
      </div>
    </Layout>
  );
};

export default AccountLayout;
