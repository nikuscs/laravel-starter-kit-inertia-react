We gonna implement a new feature end to end. Your gonna plan the feature with me side by side and resolve every unknown branch that could feel unclear.
Please suggest an answer for every question that could feel unclear. And provide alternatives if you can.

# Whats wanted

We want to implement a feature that allow us to manage our air plans inventory. This will consist in a single page, very simple mental model and possibly one table.
Possible properties for the plan:

- Name
- Model
- Manufacturer
- Dates: Purchased at, last flight at, last maintenance at, etc
- Location: Where is the plane stored?
- Status: In service, in maintenance, in storage, etc
- Notes: Any other information that could be useful to know about the plane

If possible orchestrate the plan so plumbing is done first, so we can get multiple agents to work at the same time.

# Features we want to implement

- Seeders
- Model
- Edit, Create, Delete, View ( CRUD )
- Pagination
- Inertia Based
- Small suite of unit tests to cover the basic functionality / happy path.

# UI

We will use shadcn/ui for the components and layout, please do not use any datatables or complex stuff, divs and simpple components are fine.
Dont bloat the UI, if needed delegate verbose info to the "view"
Keep in clean and mobile first.
Use shadcn examples to get some imagination/concepts

Once your are done save to pending plans.

# Behaviour

- Incldue code snippets with code style and etc so we can review it before planning

-------

Follow ups done ( from the first prompt ):

ME: Does this will work if i do db:fresh -seed and etc? Can we ensure that we can also run the seeder santadalone and it will seed for current users as well? Can be the plans be bond to users?
ME: #[CurrentUser] -> is this a laravel 13 convention? AI Replied with: 
AI: To answer your question: yes, #[CurrentUser] is a Laravel 13 convention. It's a built-in container attribute (Illuminate\Container\Attributes\CurrentUser) that resolves the authenticated user via dependency injection — no need to call $request->user() or auth()->user(). Your codebase already uses it in UserProfileController.php:26. It's cleaner than injecting Request just to grab the user.