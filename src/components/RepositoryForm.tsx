
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { GitBranch } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface RepositoryFormProps {
  onSubmit: (repoUrl: string, token: string) => void;
  isLoading: boolean;
}

const formSchema = z.object({
  repoUrl: z.string().min(1, "Repository URL is required"),
  gitlabToken: z.string().min(1, "GitLab token is required"),
});

const RepositoryForm: React.FC<RepositoryFormProps> = ({ onSubmit, isLoading }) => {
  const repositoryOptions = [
    {
      value: "https://git.vermeg.com/Palmyra-Group/Palmyra-IntegrationTests/automatictests/automatictest-core/BigDataWeb.git",
      label: "BigDataWeb"
    },
    {
      value: "https://git.vermeg.com/Palmyra-Group/Palmyra-IntegrationTests/automatictests/automatictest-core/bigdatatest.git",
      label: "bigdatatest"
    },
    {
      value: "https://git.vermeg.com/Palmyra-Group/Palmyra-IntegrationTests/automatictests/IntegrationTest.git",
      label: "IntegrationTest"
    },
    {
      value: "https://git.vermeg.com/Palmyra-Group/Palmyra-IntegrationTests/automatictests/securitytest3.git",
      label: "securitytest3"
    },
    {
      value: "https://git.vermeg.com/Palmyra-Group/QA/automatisation/automatic-project-creation/entreprise-project-vermeg/hap.git",
      label: "HAP"
    },
    {
      value: "https://git.vermeg.com/Palmyra-Group/QA/automatisation/automation-hotfix.git",
      label: "automation-hotfix"
    },
    {
      value: "https://git.vermeg.com/Palmyra-Group/Palmyra-IntegrationTests/automatictests/SecurityTest.git",
      label: "SecurityTest"
    }
  ];
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      repoUrl: "",
      gitlabToken: "",
    },
  });

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values.repoUrl, values.gitlabToken);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 w-full max-w-md">
        <FormField
          control={form.control}
          name="repoUrl"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>GitLab Repository</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a repository" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {repositoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="gitlabToken"
          render={({ field }) => (
            <FormItem>
              <FormLabel>GitLab Access Token</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="Enter your GitLab personal access token" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="text-xs text-muted-foreground">
          Select a Vermeg GitLab repository and provide your GitLab token to analyze its pipelines
        </div>
        
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing
            </span>
          ) : (
            <span className="flex items-center">
              <GitBranch className="mr-2 h-4 w-4" />
              Analyze
            </span>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default RepositoryForm;
