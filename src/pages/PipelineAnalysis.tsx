
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { FileText, Filter, Search, ArrowUp, ArrowDown } from "lucide-react";
import { exportPipelinesToExcel } from "@/lib/gitlab-api";
import { Card } from "@/components/ui/card";
import { type Pipeline } from "@/components/PipelineCard";
import PipelineStatus from "@/components/PipelineStatus";
import { toast } from "@/hooks/use-toast";

interface SortConfig {
  key: keyof Pipeline | "";
  direction: "asc" | "desc";
}

interface FilterState {
  name: string;
  status: string;
  palmyraVersion: string;
}

const PipelineAnalysis = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [allPipelines, setAllPipelines] = useState<Pipeline[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "", direction: "asc" });
  const [filters, setFilters] = useState<FilterState>({
    name: "",
    status: "",
    palmyraVersion: "",
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Get stored repositories from localStorage
  const getStoredRepositories = () => {
    const storedRepos = localStorage.getItem("repositories");
    return storedRepos ? JSON.parse(storedRepos) : [];
  };

  // Load pipelines from all repositories
  useEffect(() => {
    const loadAllPipelines = async () => {
      setIsLoading(true);
      try {
        const repositories = getStoredRepositories();
        const allPipelinesData: Pipeline[] = [];

        // Load pipelines from each repository
        for (const repo of repositories) {
          try {
            const response = await fetch(`/api/pipelines?repo=${encodeURIComponent(repo.url)}&token=${encodeURIComponent(repo.token)}`);
            if (response.ok) {
              const repoData = await response.json();
              allPipelinesData.push(...repoData);
            }
          } catch (error) {
            console.error(`Error fetching pipelines for repo ${repo.url}:`, error);
          }
        }

        setAllPipelines(allPipelinesData);
        setPipelines(allPipelinesData);
      } catch (error) {
        console.error("Failed to load pipelines:", error);
        toast({
          title: "Error",
          description: "Failed to load pipelines. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAllPipelines();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let filteredData = [...allPipelines];

    // Apply filters
    if (filters.name) {
      filteredData = filteredData.filter(pipeline => 
        pipeline.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    if (filters.status) {
      filteredData = filteredData.filter(pipeline => 
        pipeline.status === filters.status
      );
    }

    if (filters.palmyraVersion) {
      filteredData = filteredData.filter(pipeline => 
        pipeline.palmyraVersion.toLowerCase().includes(filters.palmyraVersion.toLowerCase())
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filteredData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    setPipelines(filteredData);
  }, [allPipelines, filters, sortConfig]);

  // Handle sorting
  const handleSort = (key: keyof Pipeline) => {
    let direction: "asc" | "desc" = "asc";
    
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    
    setSortConfig({ key, direction });
  };

  // Handle filter change
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({ name: "", status: "", palmyraVersion: "" });
    setSortConfig({ key: "", direction: "asc" });
    setCurrentPage(1);
  };

  // Export to Excel
  const handleExport = () => {
    if (pipelines.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no pipelines to export.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      exportPipelinesToExcel(pipelines);
      toast({
        title: "Export Successful",
        description: "Pipelines data has been exported to Excel.",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export pipelines data.",
        variant: "destructive",
      });
    }
  };

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPipelines = pipelines.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(pipelines.length / itemsPerPage);

  // Generate page numbers for pagination
  const pageNumbers = [];
  const maxPagesShown = 5;
  
  if (totalPages <= maxPagesShown) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    // Always include first page
    pageNumbers.push(1);
    
    // Calculate start and end of the current window
    let startPage = Math.max(2, currentPage - Math.floor(maxPagesShown / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxPagesShown - 3);
    
    // Adjust if we're near the end
    if (endPage - startPage < maxPagesShown - 3) {
      startPage = Math.max(2, endPage - (maxPagesShown - 3));
    }
    
    // Add ellipsis if needed
    if (startPage > 2) {
      pageNumbers.push("...");
    }
    
    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    // Add ellipsis if needed
    if (endPage < totalPages - 1) {
      pageNumbers.push("...");
    }
    
    // Always include last page
    pageNumbers.push(totalPages);
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Pipeline Analysis</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetFilters} className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Reset Filters
            </Button>
            <Button onClick={handleExport} className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Export to Excel
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-4">
          <h2 className="text-lg font-semibold mb-2">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">Pipeline Name</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="name"
                  name="name"
                  placeholder="Filter by name"
                  className="pl-8"
                  value={filters.name}
                  onChange={handleFilterChange}
                />
              </div>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-1">Status</label>
              <Input
                id="status"
                name="status"
                placeholder="Filter by status"
                value={filters.status}
                onChange={handleFilterChange}
              />
            </div>
            <div>
              <label htmlFor="palmyraVersion" className="block text-sm font-medium mb-1">Palmyra Version</label>
              <Input
                id="palmyraVersion"
                name="palmyraVersion"
                placeholder="Filter by version"
                value={filters.palmyraVersion}
                onChange={handleFilterChange}
              />
            </div>
          </div>
        </Card>

        {/* Results count */}
        <div className="text-sm text-gray-600 mb-2">
          {isLoading ? 'Loading...' : `${pipelines.length} results found`}
        </div>

        {/* Table */}
        <Card>
          <Table>
            <TableCaption>Pipeline Analysis Results</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort('name')} className="cursor-pointer">
                  <div className="flex items-center gap-1">
                    Pipeline Name
                    {sortConfig.key === 'name' && (
                      sortConfig.direction === 'asc' ? 
                        <ArrowUp className="h-4 w-4" /> : 
                        <ArrowDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort('palmyraVersion')} className="cursor-pointer">
                  <div className="flex items-center gap-1">
                    Palmyra Version
                    {sortConfig.key === 'palmyraVersion' && (
                      sortConfig.direction === 'asc' ? 
                        <ArrowUp className="h-4 w-4" /> : 
                        <ArrowDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort('status')} className="cursor-pointer">
                  <div className="flex items-center gap-1">
                    Status
                    {sortConfig.key === 'status' && (
                      sortConfig.direction === 'asc' ? 
                        <ArrowUp className="h-4 w-4" /> : 
                        <ArrowDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead>Started At</TableHead>
                <TableHead>Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">Loading pipelines...</TableCell>
                </TableRow>
              ) : currentPipelines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">No pipelines found</TableCell>
                </TableRow>
              ) : (
                currentPipelines.map((pipeline) => (
                  <TableRow key={pipeline.id}>
                    <TableCell className="font-medium">
                      <a href={pipeline.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {pipeline.name}
                      </a>
                    </TableCell>
                    <TableCell>{pipeline.palmyraVersion}</TableCell>
                    <TableCell>
                      <PipelineStatus status={pipeline.status} />
                    </TableCell>
                    <TableCell>{new Date(pipeline.startedAt).toLocaleString()}</TableCell>
                    <TableCell>{pipeline.duration}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="flex justify-center p-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {pageNumbers.map((page, index) => (
                    <PaginationItem key={index}>
                      {page === "..." ? (
                        <span className="px-4 py-2">...</span>
                      ) : (
                        <PaginationLink 
                          isActive={currentPage === page} 
                          onClick={() => typeof page === 'number' && setCurrentPage(page)}
                        >
                          {page}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default PipelineAnalysis;
