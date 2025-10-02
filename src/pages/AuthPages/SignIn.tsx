import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Connexion | Collections"
        description="C'est la page de connexion"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
