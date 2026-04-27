
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'staff');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Tighten existing tables: remove public write where appropriate
-- Menu: only admins/staff can manage; public can view available items
DROP POLICY IF EXISTS "Anyone can manage menu" ON public.menu_items;
CREATE POLICY "Staff can manage menu"
  ON public.menu_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

-- Tables: only staff/admin can manage
DROP POLICY IF EXISTS "Anyone can manage tables" ON public.restaurant_tables;
CREATE POLICY "Staff can manage tables"
  ON public.restaurant_tables FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

-- Orders: public can create (place orders), staff can manage
DROP POLICY IF EXISTS "Anyone can manage orders" ON public.orders;
CREATE POLICY "Anyone can create orders"
  ON public.orders FOR INSERT TO anon, authenticated
  WITH CHECK (true);
CREATE POLICY "Staff can update orders"
  ON public.orders FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));
CREATE POLICY "Admins can delete orders"
  ON public.orders FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Order items: public can insert as part of order, staff can manage
DROP POLICY IF EXISTS "Anyone can manage order items" ON public.order_items;
CREATE POLICY "Anyone can create order items"
  ON public.order_items FOR INSERT TO anon, authenticated
  WITH CHECK (true);
CREATE POLICY "Staff can update order items"
  ON public.order_items FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));
CREATE POLICY "Staff can delete order items"
  ON public.order_items FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

-- Bookings: public can create, staff can manage
DROP POLICY IF EXISTS "Anyone can manage bookings" ON public.bookings;
CREATE POLICY "Anyone can create bookings"
  ON public.bookings FOR INSERT TO anon, authenticated
  WITH CHECK (true);
CREATE POLICY "Staff can update bookings"
  ON public.bookings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));
CREATE POLICY "Staff can delete bookings"
  ON public.bookings FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

-- Realtime
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- Storage bucket for dish images
INSERT INTO storage.buckets (id, name, public) VALUES ('dish-images', 'dish-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view dish images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'dish-images');

CREATE POLICY "Staff can upload dish images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'dish-images' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')));

CREATE POLICY "Staff can update dish images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'dish-images' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')));

CREATE POLICY "Staff can delete dish images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'dish-images' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')));
