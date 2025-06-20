import React, { useState } from 'react';
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminStats } from "@/components/admin/AdminStats";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { CandidateTable } from "@/components/admin/CandidateTable";
import { EmptyState } from "@/components/admin/EmptyState";
import { useCandidates } from "@/hooks/useCandidates";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Admin = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { candidates, loading, refetchCandidates } = useCandidates();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'admin')) {
      navigate('/');
    }
  }, [user, profile, loading, navigate]);

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || candidate.submissionStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <AdminHeader />
        
        <AdminStats candidates={candidates} />
        
        <AdminFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onRefresh={refetchCandidates}
        />

        {filteredCandidates.length === 0 ? (
          <EmptyState
            hasSearch={searchTerm.length > 0 || statusFilter !== "all"}
            onClearFilters={() => {
              setSearchTerm("");
              setStatusFilter("all");
            }}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <CandidateTable 
              candidates={filteredCandidates}
              onCandidateDeleted={refetchCandidates}
              onInviteResent={refetchCandidates}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
