import { Box, Card, CardContent, Typography } from "@mui/material";
import AdminPageHeader from "@/components/admin-page-header";
import HomeIcon from '@mui/icons-material/Home';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import CollectionsIcon from '@mui/icons-material/Collections';
import WorkIcon from '@mui/icons-material/Work';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PendingIcon from '@mui/icons-material/Pending';
import { getServerURL } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  gradient: string;
}

function StatCard({ title, value, subtitle, icon, gradient }: StatCardProps) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        position: 'relative',
        '&:hover': {
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          transform: 'translateY(-2px)',
        },
        transition: 'all 0.3s ease',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography
              variant="overline"
              sx={{
                color: 'text.secondary',
                fontSize: '0.7rem',
                letterSpacing: '0.05em',
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                background: gradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mt: 0.5,
              }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              background: gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              '& .MuiSvgIcon-root': {
                fontSize: 24,
              },
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

async function getStats() {
  try {
    const [jobsRes, collectionsRes] = await Promise.all([
      fetch(`${getServerURL()}/api/jobs?limit=1`, { cache: 'no-store' }),
      fetch(`${getServerURL()}/api/collections?page=0&rowsPerPage=1`, { cache: 'no-store' }),
    ]);

    const jobsData = await jobsRes.json();
    const collectionsData = await collectionsRes.json();

    return {
      jobs: {
        total: jobsData.total || 0,
        pending: jobsData.pending || 0,
        completed: jobsData.completed || 0,
        failed: jobsData.failed || 0,
      },
      collections: collectionsData.total || 0,
    };
  } catch {
    return {
      jobs: { total: 0, pending: 0, completed: 0, failed: 0 },
      collections: 0,
    };
  }
}

export default async function AdminPage() {
  const stats = await getStats();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <AdminPageHeader
        title="Dashboard"
        subtitle="Welcome to the Spriggle Admin Portal"
        icon={<HomeIcon />}
      />

      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {/* Stats Grid */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: '#1a1a2e',
            mb: 2,
          }}
        >
          Overview
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 3,
            mb: 4,
          }}
        >
          <StatCard
            title="Total Jobs"
            value={stats.jobs.total}
            subtitle="All time"
            icon={<WorkIcon />}
            gradient="linear-gradient(135deg, #9966FF 0%, #7A52CC 100%)"
          />
          <StatCard
            title="Pending Jobs"
            value={stats.jobs.pending}
            subtitle="Awaiting processing"
            icon={<PendingIcon />}
            gradient="linear-gradient(135deg, #FF8866 0%, #FF6B4A 100%)"
          />
          <StatCard
            title="Completed Jobs"
            value={stats.jobs.completed}
            subtitle="Successfully processed"
            icon={<CheckCircleIcon />}
            gradient="linear-gradient(135deg, #4CAF50 0%, #45a049 100%)"
          />
          <StatCard
            title="Failed Jobs"
            value={stats.jobs.failed}
            subtitle="Require attention"
            icon={<ErrorIcon />}
            gradient="linear-gradient(135deg, #f44336 0%, #d32f2f 100%)"
          />
        </Box>

        {/* Quick Actions */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: '#1a1a2e',
            mb: 2,
          }}
        >
          Quick Actions
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 2,
          }}
        >
          {[
            {
              title: 'Manage Books',
              description: 'View and manage your audiobook catalog',
              icon: <LibraryBooksIcon />,
              href: '/admin/books',
              color: '#9966FF',
            },
            {
              title: 'Collections',
              description: 'Organize books into collections',
              icon: <CollectionsIcon />,
              href: '/admin/collections',
              color: '#FF8866',
            },
            {
              title: 'Jobs Queue',
              description: 'Monitor audio processing jobs',
              icon: <WorkIcon />,
              href: '/admin/jobs',
              color: '#4CAF50',
            },
          ].map((action, idx) => (
            <Card
              key={idx}
              component="a"
              href={action.href}
              sx={{
                borderRadius: 3,
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
                textDecoration: 'none',
                color: 'inherit',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                  transform: 'translateY(-2px)',
                  '& .action-icon': {
                    transform: 'scale(1.1)',
                  },
                },
                transition: 'all 0.3s ease',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box
                    className="action-icon"
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      bgcolor: `${action.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: action.color,
                      transition: 'transform 0.3s ease',
                      '& .MuiSvgIcon-root': {
                        fontSize: 24,
                      },
                    }}
                  >
                    {action.icon}
                  </Box>
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        color: '#1a1a2e',
                      }}
                    >
                      {action.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        mt: 0.25,
                      }}
                    >
                      {action.description}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
  );
}