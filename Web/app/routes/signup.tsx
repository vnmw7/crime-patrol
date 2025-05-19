import { useState } from "react";
import { Form, Link, useActionData } from "@remix-run/react";
import type { ActionFunction, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { createAccount, signIn } from "../lib/appwrite"; // Import Appwrite functions

export const meta: MetaFunction = () => {
  return [
    { title: "Sign Up - Crime Patrol" },
    {
      name: "description",
      content:
        "Create a new account on Crime Patrol to report incidents and help keep your community safe",
    },
  ];
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const confirmPassword = formData.get("confirmPassword")?.toString();
  const name = formData.get("name")?.toString();

  // Basic validation
  const errors: {
    email?: string;
    password?: string;
    confirmPassword?: string;
    name?: string;
    form?: string; // Add form error type
  } = {};

  if (!name) errors.name = "Name is required";
  if (!email) errors.email = "Email is required";
  // Add email format validation if desired
  // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // if (email && !emailRegex.test(email)) errors.email = "Invalid email format";

  if (!password) errors.password = "Password is required";
  if (password && password.length < 8)
    errors.password = "Password must be at least 8 characters";
  if (password !== confirmPassword)
    errors.confirmPassword = "Passwords do not match";

  if (Object.keys(errors).length > 0) {
    return json({ errors }, { status: 400 }); // Return 400 for validation errors
  }

  try {
    // Attempt to create the account using Appwrite
    await createAccount(email!, password!, name!); // Use non-null assertions after validation

    // Immediately attempt to sign in the new user
    // Note: Appwrite might require email verification first depending on project settings.
    // If verification is needed, you might redirect to login or a verification pending page.
    await signIn(email!, password!);

    // On successful signup and sign-in, redirect to the dashboard
    return redirect("/dashboard");
  } catch (error: unknown) {
    console.error("Signup error:", error);
    if (error instanceof Error) {
      // Check for specific Appwrite errors if needed, otherwise use the message
      if (error.message.includes("already exists")) {
        errors.email = "An account with this email already exists.";
      } else {
        errors.form = error.message;
      }
    } else {
      errors.form = "An unexpected error occurred during signup.";
    }
    // Determine appropriate status code (e.g., 409 Conflict for existing user, 500 for others)
    const status =
      error instanceof Error && error.message.includes("already exists")
        ? 409
        : 500;
    return json({ errors }, { status });
  }
};

export default function SignUp() {
  const actionData = useActionData<typeof action>();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = () => {
    setIsLoading(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8">
          <Link
            to="/"
            className="text-3xl font-bold text-blue-600 dark:text-blue-400"
          >
            Crime Patrol
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Sign in
            </Link>
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 px-6 py-8">
          {actionData?.errors?.form ? (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">
                {actionData.errors.form}
              </p>
            </div>
          ) : null}

          <Form method="post" onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Full name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="John Doe"
                />
                {actionData?.errors?.name ? (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {actionData.errors.name}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="you@example.com"
                />
                {actionData?.errors?.email ? (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {actionData.errors.email}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
                {actionData?.errors?.password ? (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {actionData.errors.password}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
                {actionData?.errors?.confirmPassword ? (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {actionData.errors.confirmPassword}
                  </p>
                ) : null}
              </div>

              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  required
                />
                <label
                  htmlFor="terms"
                  className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                >
                  I agree to the{" "}
                  <Link
                    to="/terms"
                    className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  {isLoading ? "Creating account..." : "Create account"}
                </button>
              </div>
            </div>
          </Form>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link
          to="/"
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          &larr; Back to home page
        </Link>
      </div>
    </div>
  );
}
