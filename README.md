BACKEND

 * Users can create forms

 * Submit responses to those forms, and

 * Fetch both the form structure and responses.

 why uuid ?
  Imports the v4 method from the uuid library. This generates a Universally Unique Identifier (UUID) version 4.
  because we cant deal with ObjectId in URL.So we are using uuid.

FRONTEND

* FormBuilder.jsx:

   Lets users build and publish a form.

    Supports multiple question types.

   Can generate a public response link.

   Allows copying link and navigating to responses.

* FormRes

