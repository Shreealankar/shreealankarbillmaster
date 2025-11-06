import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Search, Edit } from "lucide-react";
import { format } from "date-fns";

interface RepairJob {
  id: string;
  job_number: string;
  customer_id: string;
  item_description: string;
  metal_type: string;
  weight_grams: number;
  job_type: string;
  estimated_cost: number;
  actual_cost: number;
  advance_paid: number;
  received_date: string;
  promised_date: string;
  completion_date: string;
  delivery_date: string;
  status: string;
  notes: string;
  customers?: { name: string; phone: string };
}

export default function RepairJobs() {
  const [jobs, setJobs] = useState<RepairJob[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<RepairJob | null>(null);
  const [formData, setFormData] = useState<Partial<RepairJob>>({
    status: "received",
    metal_type: "gold",
  });

  useEffect(() => {
    fetchJobs();
    fetchCustomers();
  }, []);

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from("repair_jobs")
      .select("*, customers(name, phone)")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch repair jobs");
      return;
    }
    setJobs(data || []);
  };

  const fetchCustomers = async () => {
    const { data } = await supabase
      .from("customers")
      .select("id, name, phone")
      .order("name", { ascending: true });
    setCustomers(data || []);
  };

  const generateJobNumber = async () => {
    const { data } = await supabase.rpc("generate_job_number");
    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingJob) {
      const { error } = await supabase
        .from("repair_jobs")
        .update(formData)
        .eq("id", editingJob.id);

      if (error) {
        toast.error("Failed to update repair job");
        return;
      }
      toast.success("Repair job updated successfully");
    } else {
      if (!formData.item_description || !formData.customer_id || !formData.job_type) {
        toast.error("Please fill all required fields");
        return;
      }
      const jobNumber = await generateJobNumber();
      const jobData = {
        ...formData,
        job_number: jobNumber,
        item_description: formData.item_description,
        customer_id: formData.customer_id,
        job_type: formData.job_type,
      };

      const { error } = await supabase.from("repair_jobs").insert([jobData as any]);

      if (error) {
        toast.error("Failed to create repair job");
        return;
      }
      toast.success("Repair job created successfully");
    }

    setIsDialogOpen(false);
    setEditingJob(null);
    setFormData({ status: "received", metal_type: "gold" });
    fetchJobs();
  };

  const handleEdit = (job: RepairJob) => {
    setEditingJob(job);
    setFormData(job);
    setIsDialogOpen(true);
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.job_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customers?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "received":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "delivered":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Repair Jobs</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingJob(null);
                setFormData({ status: "received", metal_type: "gold" });
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingJob ? "Edit Repair Job" : "Create New Repair Job"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="customer_id">Customer *</Label>
                  <Select
                    value={formData.customer_id}
                    onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} - {customer.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="item_description">Item Description *</Label>
                  <Textarea
                    id="item_description"
                    required
                    value={formData.item_description || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, item_description: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metal_type">Metal Type *</Label>
                  <Select
                    value={formData.metal_type}
                    onValueChange={(value) => setFormData({ ...formData, metal_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gold">Gold</SelectItem>
                      <SelectItem value="silver">Silver</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight_grams">Weight (grams)</Label>
                  <Input
                    id="weight_grams"
                    type="number"
                    step="0.001"
                    value={formData.weight_grams || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, weight_grams: parseFloat(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="job_type">Job Type *</Label>
                  <Input
                    id="job_type"
                    required
                    placeholder="e.g., Polish, Repair, Resize, etc."
                    value={formData.job_type || ""}
                    onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimated_cost">Estimated Cost</Label>
                  <Input
                    id="estimated_cost"
                    type="number"
                    step="0.01"
                    value={formData.estimated_cost || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, estimated_cost: parseFloat(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="advance_paid">Advance Paid</Label>
                  <Input
                    id="advance_paid"
                    type="number"
                    step="0.01"
                    value={formData.advance_paid || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, advance_paid: parseFloat(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="received_date">Received Date *</Label>
                  <Input
                    id="received_date"
                    type="date"
                    required
                    value={formData.received_date || ""}
                    onChange={(e) => setFormData({ ...formData, received_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="promised_date">Promised Date</Label>
                  <Input
                    id="promised_date"
                    type="date"
                    value={formData.promised_date || ""}
                    onChange={(e) => setFormData({ ...formData, promised_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="received">Received</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="actual_cost">Actual Cost</Label>
                  <Input
                    id="actual_cost"
                    type="number"
                    step="0.01"
                    value={formData.actual_cost || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, actual_cost: parseFloat(e.target.value) })
                    }
                  />
                </div>
                {formData.status === "completed" && (
                  <div className="space-y-2">
                    <Label htmlFor="completion_date">Completion Date</Label>
                    <Input
                      id="completion_date"
                      type="date"
                      value={formData.completion_date || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, completion_date: e.target.value })
                      }
                    />
                  </div>
                )}
                {formData.status === "delivered" && (
                  <div className="space-y-2">
                    <Label htmlFor="delivery_date">Delivery Date</Label>
                    <Input
                      id="delivery_date"
                      type="date"
                      value={formData.delivery_date || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, delivery_date: e.target.value })
                      }
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingJob ? "Update" : "Create"} Job</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Job Type</TableHead>
                <TableHead>Received</TableHead>
                <TableHead>Promised</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.job_number}</TableCell>
                  <TableCell>{job.customers?.name}</TableCell>
                  <TableCell>{job.item_description.substring(0, 30)}...</TableCell>
                  <TableCell>{job.job_type}</TableCell>
                  <TableCell>{format(new Date(job.received_date), "MMM dd, yyyy")}</TableCell>
                  <TableCell>
                    {job.promised_date
                      ? format(new Date(job.promised_date), "MMM dd, yyyy")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(job.status)}`}>
                      {job.status.replace("_", " ")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(job)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}