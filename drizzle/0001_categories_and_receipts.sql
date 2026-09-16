ALTER TABLE orders ADD COLUMN IF NOT EXISTS receipt_token_hash varchar(64);
--> statement-breakpoint
INSERT INTO categories (id, slug, name, display_order, is_active) VALUES
('corales-sps', 'corales-sps', 'Corales SPS', 1, true),
('corales-lps', 'corales-lps', 'Corales LPS', 2, true),
('corales-blandos', 'corales-blandos', 'Corales Blandos y Zoanthus', 3, true),
('peces-marinos', 'peces-marinos', 'Peces Marinos', 4, true),
('anemonas', 'anemonas', 'Anémonas', 5, true),
('invertebrados', 'invertebrados', 'Invertebrados', 6, true),
('accesorios', 'accesorios', 'Accesorios', 7, true),
('alimentos-aditivos', 'alimentos-aditivos', 'Alimentos y Aditivos', 8, true)
ON CONFLICT (id) DO NOTHING;
--> statement-breakpoint
UPDATE products SET category_id = 'anemonas', updated_at = now()
WHERE category_id = 'anemonas-invertebrados' AND type ILIKE '%an_mona%';
--> statement-breakpoint
UPDATE products SET category_id = 'invertebrados', updated_at = now()
WHERE category_id = 'anemonas-invertebrados' AND type ILIKE '%invertebrado%';
--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM products WHERE category_id = 'anemonas-invertebrados') THEN
    RAISE EXCEPTION 'Hay productos mixtos sin clasificar; revisa su tipo antes de migrar.';
  END IF;
END $$;
--> statement-breakpoint
UPDATE categories SET is_active = false WHERE id = 'anemonas-invertebrados';
