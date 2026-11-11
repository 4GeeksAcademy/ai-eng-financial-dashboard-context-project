-- Seed richer telemetry events for pipeline verification (Part 2).
-- The pipeline only READS telemetry_events; these rows exercise the KPIs.
INSERT INTO telemetry_events (timestamp, service, event_type, level, value, message, tags) VALUES
('2026-06-20T09:00:00Z','inventory','inbound_order_created','info',100,'supply received','{"clinic_id":"clinic_01","country":"US","quantity":100,"unit_cost":2.50,"product_id":"p2"}'),
('2026-06-20T10:00:00Z','inventory','inbound_order_created','info',80,'supply received','{"clinic_id":"clinic_04","country":"US","quantity":80,"unit_cost":1.75,"product_id":"p3"}'),
('2026-06-21T09:30:00Z','inventory','outbound_order_created','info',30,'supply consumed','{"clinic_id":"clinic_01","country":"US","quantity":30,"product_id":"p2"}'),
('2026-06-21T10:00:00Z','inventory','outbound_order_created','info',12,'supply consumed','{"clinic_id":"clinic_04","country":"US","quantity":12,"product_id":"p3"}'),
('2026-06-22T08:00:00Z','inventory','stock_threshold_triggered','warn',4,'low stock','{"clinic_id":"clinic_02","country":"UK","product_id":"p1","reorder_point":10,"available_stock":4}'),
('2026-06-22T09:00:00Z','inventory','supply_expiry_flagged','warn',7,'expiring soon','{"clinic_id":"clinic_02","country":"UK","product_id":"p4","expires_in_days":25}'),
('2026-10-05T11:00:00Z','inventory','inbound_order_created','info',60,'supply received','{"clinic_id":"clinic_05","country":"UK","quantity":60,"unit_cost":3.00,"product_id":"p5"}'),
('2026-10-06T12:00:00Z','inventory','outbound_order_created','info',25,'supply consumed','{"clinic_id":"clinic_05","country":"UK","quantity":25,"product_id":"p5"}'),
('2026-10-06T12:30:00Z','inventory','stock_threshold_triggered','warn',3,'low stock','{"clinic_id":"clinic_05","country":"UK","product_id":"p5","reorder_point":15,"available_stock":3}'),
('2026-10-07T09:00:00Z','inventory','supply_expiry_flagged','warn',10,'expiring soon','{"clinic_id":"clinic_05","country":"UK","product_id":"p4","expires_in_days":15}');
