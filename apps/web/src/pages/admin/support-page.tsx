import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { HeadphonesIcon, Clock, AlertCircle, Send } from 'lucide-react';
import { listTickets, getTicket, updateTicket, replyTicket, extractErrorMessage } from '@/api/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FilterBar, type FilterConfig } from '@/components/admin/filter-bar';
import { Pagination } from '@/components/admin/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Ticket = {
  id: string;
  subject: string;
  status: string;
  priority: string;
  assignedTo: string | null;
  user: {
    id: string;
    email: string;
    name: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
};

const filterConfigs: FilterConfig[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Open', value: 'OPEN' },
      { label: 'In Progress', value: 'IN_PROGRESS' },
      { label: 'Resolved', value: 'RESOLVED' },
      { label: 'Closed', value: 'CLOSED' },
    ],
  },
  {
    key: 'priority',
    label: 'Priority',
    type: 'select',
    options: [
      { label: 'Low', value: 'LOW' },
      { label: 'Medium', value: 'MEDIUM' },
      { label: 'High', value: 'HIGH' },
      { label: 'Urgent', value: 'URGENT' },
    ],
  },
];

export function AdminSupportPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({
    status: '',
    priority: '',
  });
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const limit = 20;

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'tickets', filters, page],
    queryFn: () => listTickets({ ...filters, page, limit }),
  });

  const { data: ticketDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ['admin', 'ticket', selectedTicket],
    queryFn: () => getTicket(selectedTicket!),
    enabled: !!selectedTicket,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: any }) => updateTicket(id, patch),
    onSuccess: () => {
      toast.success('Ticket updated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'tickets'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'ticket'] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) => replyTicket(id, body),
    onSuccess: () => {
      toast.success('Reply sent');
      setReplyText('');
      queryClient.invalidateQueries({ queryKey: ['admin', 'ticket', selectedTicket] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleReset = () => {
    setFilters({ status: '', priority: '' });
    setPage(1);
  };

  const handleStatusChange = (ticketId: string, newStatus: string) => {
    updateMutation.mutate({ id: ticketId, patch: { status: newStatus } });
  };

  const handlePriorityChange = (ticketId: string, newPriority: string) => {
    updateMutation.mutate({ id: ticketId, patch: { priority: newPriority } });
  };

  const handleSendReply = () => {
    if (!selectedTicket || !replyText.trim()) return;
    replyMutation.mutate({ id: selectedTicket, body: replyText });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'destructive';
      case 'HIGH':
        return 'default';
      case 'MEDIUM':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'destructive';
      case 'IN_PROGRESS':
        return 'default';
      case 'RESOLVED':
        return 'secondary';
      case 'CLOSED':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Support Tickets</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Manage and respond to customer support requests
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats?.open || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats?.inProgress || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-neutral-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats?.avgResponseTime || '—'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
            <HeadphonesIcon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats?.satisfaction || '—'}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <FilterBar
            filters={filterConfigs}
            values={filters}
            onChange={handleFilterChange}
            onReset={handleReset}
          />
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Tickets ({data?.pagination.total || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : data && data.items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200 text-sm dark:border-neutral-800">
                    <th className="pb-3 text-left font-medium">ID</th>
                    <th className="pb-3 text-left font-medium">Subject</th>
                    <th className="pb-3 text-left font-medium">User</th>
                    <th className="pb-3 text-left font-medium">Status</th>
                    <th className="pb-3 text-left font-medium">Priority</th>
                    <th className="pb-3 text-left font-medium">Assigned</th>
                    <th className="pb-3 text-left font-medium">Created</th>
                    <th className="pb-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((ticket: Ticket) => (
                    <tr
                      key={ticket.id}
                      className="border-b border-neutral-100 transition-colors hover:bg-neutral-50 dark:border-neutral-900 dark:hover:bg-neutral-900"
                    >
                      <td className="py-4 text-sm font-mono">
                        {ticket.id.slice(0, 8)}
                      </td>
                      <td className="py-4">
                        <button
                          onClick={() => setSelectedTicket(ticket.id)}
                          className="font-medium hover:text-emerald-600"
                        >
                          {ticket.subject}
                        </button>
                      </td>
                      <td className="py-4 text-sm">
                        {ticket.user?.email || 'No user'}
                      </td>
                      <td className="py-4">
                        <Badge variant={getStatusColor(ticket.status)}>
                          {ticket.status}
                        </Badge>
                      </td>
                      <td className="py-4">
                        <Badge variant={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </td>
                      <td className="py-4 text-sm">
                        {ticket.assignedTo || 'Unassigned'}
                      </td>
                      <td className="py-4 text-sm text-neutral-600 dark:text-neutral-400">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTicket(ticket.id)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-neutral-500">
              No tickets found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={data.pagination.totalPages}
          totalItems={data.pagination.total}
          itemsPerPage={limit}
          onPageChange={setPage}
          loading={isLoading}
        />
      )}

      {/* Ticket Detail Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Ticket Details</DialogTitle>
          </DialogHeader>
          {detailsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : ticketDetails ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{ticketDetails.subject}</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    From: {ticketDetails.user?.email || 'No user'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Select
                    value={ticketDetails.status}
                    onValueChange={(value) => handleStatusChange(ticketDetails.id, value)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={ticketDetails.priority}
                    onValueChange={(value) => handlePriorityChange(ticketDetails.id, value)}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
                <p className="whitespace-pre-wrap">{ticketDetails.body || 'No content'}</p>
              </div>

              {ticketDetails.replies && ticketDetails.replies.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold">Replies</h4>
                  {ticketDetails.replies.map((reply: any, idx: number) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
                    >
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium">{reply.author}</span>
                        <span className="text-neutral-600 dark:text-neutral-400">
                          {new Date(reply.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{reply.body}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Reply</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  className="w-full rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800"
                  rows={4}
                />
                <Button
                  onClick={handleSendReply}
                  disabled={!replyText.trim() || replyMutation.isPending}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  Send Reply
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

