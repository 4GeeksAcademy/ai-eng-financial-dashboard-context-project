from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})

    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))

    page.goto("http://127.0.0.1:5173")
    page.wait_for_load_state("networkidle")

    assert page.get_by_role("heading", name="Financial Overview").is_visible()
    print("OK: el encabezado del dashboard es visible")

    assert page.get_by_role("region", name="Key performance indicators").is_visible()
    print("OK: la sección de indicadores es visible")

    assert page.get_by_role("region", name="Financial charts").is_visible()
    print("OK: la sección de gráficos es visible")

    assert not errors, f"Errores de JavaScript: {errors}"
    print("OK: no se detectaron errores de JavaScript")

    browser.close()
    print("PRUEBA DEL DASHBOARD COMPLETADA")
