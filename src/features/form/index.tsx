import { Form } from "./form";
import { useForm } from "./form.hook";
import { NoMFEsFound } from "./no-mfes-found.component";

export const FormIndex = () => {
    const { overrides, handleAddMFE, handleDetectMFEs } = useForm();
    return (
        <>
            {overrides.length === 0 ? (
                <NoMFEsFound
                    handleDetectMFEs={handleDetectMFEs}
                    handleAddMFE={handleAddMFE}
                />
            ) : (
                <Form />
            )}
        </>
    )
}