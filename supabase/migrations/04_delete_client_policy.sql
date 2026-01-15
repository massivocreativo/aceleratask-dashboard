-- Enable deletion for clients table based on user role
CREATE POLICY "Enable delete for CEO and Creative Director" ON "public"."clients"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  (auth.uid() IN ( 
    SELECT user_profiles.id 
    FROM user_profiles 
    WHERE (user_profiles.role IN ('CEO'::text, 'Creative Director'::text))
  ))
);
