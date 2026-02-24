"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface CompanyQuestionnaireProps {
  companyName: string;
  onCompanyNameChange: (value: string) => void;
  startedYear: string;
  onStartedYearChange: (value: string) => void;
  employees: string;
  onEmployeesChange: (value: string) => void;
  stage: string;
  onStageChange: (value: string) => void;
  logo: File | null;
  onLogoChange: (file: File | null) => void;
}

const stages = [
  { value: "startup", label: "Start up" },
  { value: "1-2-years", label: "1-2 years in business" },
  { value: "3-5-years", label: "3-5 years in business" },
  { value: "5-10-years", label: "5-10 years in business" },
  { value: "10-plus-years", label: "10 years in business or more" },
];

export function CompanyQuestionnaire({ companyName, onCompanyNameChange, startedYear, onStartedYearChange, employees, onEmployeesChange, stage, onStageChange, onLogoChange }: CompanyQuestionnaireProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type - only PNG and JPEG allowed
      const validTypes = ["image/png", "image/jpeg", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        toast.error("Invalid file type. Please upload a PNG or JPEG image.");
        e.target.value = ""; // Reset input
        return;
      }

      onLogoChange(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 py-3 sm:py-6">
      {/* Left Column - Logo Upload */}
      <div className="flex flex-col items-center justify-center">
        <div className="w-full max-w-sm h-48 sm:h-64 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-white p-4">
          {logoPreview ? (
            <div className="relative w-24 h-24 sm:w-32 sm:h-32">
              <Image src={logoPreview} alt="Company logo" fill className="object-contain" />
            </div>
          ) : (
            <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mb-3 sm:mb-4" />
          )}
          <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-4">Upload your company logo</p>
          <p className="text-gray-500 text-xs mb-3 sm:mb-4">PNG or JPEG only</p>
          <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/jpg" onChange={handleFileChange} className="hidden" />
          <Button onClick={handleChooseFile} className="bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 text-sm">
            Choose File
          </Button>
        </div>
      </div>

      {/* Right Column - Form Fields */}
      <div className="space-y-4 sm:space-y-6">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Company Name</label>
          <Input type="text" value={companyName} onChange={(e) => onCompanyNameChange(e.target.value)} placeholder="Enter your company name" className="w-full bg-gray-100 border-gray-200 text-sm" />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Started in</label>
          <Input type="text" value={startedYear} onChange={(e) => onStartedYearChange(e.target.value)} placeholder="Enter the year you started your company" className="w-full bg-gray-100 border-gray-200 text-sm" />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">No. of Employees</label>
          <Input type="text" value={employees} onChange={(e) => onEmployeesChange(e.target.value)} placeholder="Enter the number of employees in your company" className="w-full bg-gray-100 border-gray-200 text-sm" />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Stage</label>
          <Select value={stage} onValueChange={onStageChange}>
            <SelectTrigger className="w-full bg-gray-100 border-gray-200 text-sm">
              <SelectValue placeholder="Select stage" />
            </SelectTrigger>
            <SelectContent>
              {stages.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
