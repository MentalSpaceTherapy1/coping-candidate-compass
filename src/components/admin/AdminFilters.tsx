
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface AdminFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

export const AdminFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  statusFilter, 
  setStatusFilter, 
  sortBy, 
  setSortBy 
}: AdminFiltersProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Candidate Management</CardTitle>
        <CardDescription>Review and manage interview submissions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search candidates by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Sort by Date</SelectItem>
              <SelectItem value="name">Sort by Name</SelectItem>
              <SelectItem value="score">Sort by Score</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
