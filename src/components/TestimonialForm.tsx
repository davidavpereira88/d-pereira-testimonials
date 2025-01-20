import { Button } from "@/components/ui/button";
import { AuthorFields } from "@/components/AuthorFields";
import { PermissionCheckbox } from "@/components/testimonials/PermissionCheckbox";
import { useTestimonialForm } from "@/hooks/useTestimonialForm";
import { FormActions } from "@/components/admin/FormActions";
import { TestimonialContent } from "@/components/TestimonialContent";
import { ImageUpload } from "@/components/ImageUpload";

interface TestimonialFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  onDelete?: () => void;
  isAdmin?: boolean;
}

export const TestimonialForm = ({
  initialData,
  onSubmit,
  onCancel,
  onDelete,
  isAdmin = false,
}: TestimonialFormProps) => {
  console.log("Initializing TestimonialForm with data:", initialData);
  
  const { formData, handleInputChange, getSubmissionData, isFormValid } = useTestimonialForm(initialData, isAdmin);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with data:", formData);
    const submissionData = getSubmissionData();
    console.log("Processed submission data:", submissionData);
    onSubmit(submissionData);
  };

  const handleAuthorFieldChange = (field: string, value: string) => {
    switch (field) {
      case 'name':
        handleInputChange('name', value);
        break;
      case 'email':
        handleInputChange('email', value);
        break;
      case 'social':
        handleInputChange('social', value);
        break;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <TestimonialContent
          rating={formData.rating}
          text={formData.text}
          tag={formData.tag}
          onRatingChange={(rating) => handleInputChange("rating", rating)}
          onTextChange={(text) => handleInputChange("text", text)}
          onTagChange={(tag) => handleInputChange("tag", tag)}
        />

        <AuthorFields
          name={formData.name}
          email={formData.email}
          social={formData.social}
          onChange={handleAuthorFieldChange}
        />

        <ImageUpload
          initialImage={formData.photo}
          onImageChange={(url) => handleInputChange("photo", url)}
          userName={formData.name}
        />

        {!isAdmin && (
          <PermissionCheckbox
            checked={formData.permission}
            onCheckedChange={(checked) => handleInputChange("permission", checked)}
          />
        )}
      </div>

      <FormActions 
        onCancel={onCancel} 
        onDelete={onDelete} 
        isAdmin={isAdmin} 
        isSubmitDisabled={!isFormValid}
      />
    </form>
  );
};