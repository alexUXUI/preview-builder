import { Form } from "./form";
import { useForm } from "./form.hook";
import { NoMFEsFound } from "./no-mfes-found.component";

export const FormIndex = () => {
    const { overrides, handleDetectMFEs } = useForm();
    return (
        <>
            {overrides.length === 0 ? (
                <NoMFEsFound
                    handleDetectMFEs={handleDetectMFEs}
                />
            ) : (
                <Form />
            )}
        </>
    )
}