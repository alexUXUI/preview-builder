import { OverridesForm } from "./form";
import { FormProvider } from "./form.context";

export const YoForm = () => {
  return (
    <FormProvider>
      <OverridesForm />
    </FormProvider>
  );
};
