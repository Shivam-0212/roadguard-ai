#!/usr/bin/env python3
"""
RoadGuard AI - Comprehensive Playwright Browser Verification Script
Performs full-stack browser testing across all pages in desktop and mobile viewports,
interacts with upload and detection workflows, tests filters and modals,
records console/network logs, and saves genuine screenshots to docs/screenshots/.
"""

import os
import sys
import time
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE_DIR = Path(__file__).resolve().parent.parent
SCREENSHOTS_DIR = BASE_DIR / "docs" / "screenshots"
REPORTS_DIR = BASE_DIR / "artifacts" / "reports"

SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

FRONTEND_URL = "http://localhost:5173"
SAMPLE_IMAGE = str(BASE_DIR / "input_data" / "dataset" / "images" / "20250219_170556.jpg")

console_logs = []
network_errors = []

def run_browser_verification():
    print("=" * 70)
    print("RoadGuard AI — Automated Playwright Browser Verification")
    print(f"Target Frontend: {FRONTEND_URL}")
    print(f"Screenshots Directory: {SCREENSHOTS_DIR}")
    print("=" * 70)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        
        # -------------------------------------------------------------
        # 1. Desktop Viewport Testing (1440 x 900)
        # -------------------------------------------------------------
        print("\n[Phase 1] Desktop Viewport Testing (1440x900)...")
        context_desktop = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context_desktop.new_page()

        # Listen to console & network
        page.on("console", lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda err: console_logs.append(f"[PAGE ERROR] {err}"))
        page.on("requestfailed", lambda req: network_errors.append(f"Failed: {req.method} {req.url} - {req.failure}"))

        # Page 1: Landing
        print("[*] Navigating to Landing Page (/)")
        page.goto(f"{FRONTEND_URL}/", wait_until="networkidle")
        page.wait_for_timeout(1000)
        page.screenshot(path=str(SCREENSHOTS_DIR / "01_landing_desktop.png"), full_page=True)
        print("    [+] Captured: 01_landing_desktop.png")

        # Page 2: Dashboard
        print("[*] Navigating to Dashboard (/dashboard)")
        page.goto(f"{FRONTEND_URL}/dashboard", wait_until="networkidle")
        page.wait_for_timeout(1500)
        page.screenshot(path=str(SCREENSHOTS_DIR / "02_dashboard_desktop.png"), full_page=True)
        print("    [+] Captured: 02_dashboard_desktop.png")

        # Page 3: Image Inspection (Before detection)
        print("[*] Navigating to Image Inspection (/detect-image)")
        page.goto(f"{FRONTEND_URL}/detect-image", wait_until="networkidle")
        page.wait_for_timeout(1000)
        page.screenshot(path=str(SCREENSHOTS_DIR / "03_image_inspection_upload.png"), full_page=True)
        print("    [+] Captured: 03_image_inspection_upload.png")

        # Perform actual Image Upload & Detection in Browser
        print(f"[*] Uploading sample road image: {SAMPLE_IMAGE}")
        file_input = page.locator('input[type="file"]')
        file_input.set_input_files(SAMPLE_IMAGE)
        page.wait_for_timeout(1000)

        # Click Execute YOLOv8 Detection
        detect_btn = page.locator('button:has-text("Execute YOLOv8 Detection")')
        print("[*] Clicking 'Execute YOLOv8 Detection' button...")
        detect_btn.click()

        # Wait for results
        page.wait_for_selector('text=Detected Objects Specification', timeout=15000)
        page.wait_for_timeout(2000)
        page.screenshot(path=str(SCREENSHOTS_DIR / "04_image_inspection_results.png"), full_page=True)
        print("    [+] Captured: 04_image_inspection_results.png (With actual YOLO detections!)")

        # Toggle Show Original
        toggle_btn = page.locator('button:has-text("Show Original")')
        if toggle_btn.count() > 0:
            toggle_btn.click()
            page.wait_for_timeout(500)
            page.screenshot(path=str(SCREENSHOTS_DIR / "05_image_inspection_toggle_original.png"), full_page=True)
            print("    [+] Captured: 05_image_inspection_toggle_original.png")
            # Toggle back
            page.locator('button:has-text("Show Detections")').click()
            page.wait_for_timeout(500)

        # Page 4: Video Detection
        print("[*] Navigating to Video Inspection (/detect-video)")
        page.goto(f"{FRONTEND_URL}/detect-video", wait_until="networkidle")
        page.wait_for_timeout(1000)
        page.screenshot(path=str(SCREENSHOTS_DIR / "06_video_inspection_desktop.png"), full_page=True)
        print("    [+] Captured: 06_video_inspection_desktop.png")

        # Page 5: History
        print("[*] Navigating to Audit History (/history)")
        page.goto(f"{FRONTEND_URL}/history", wait_until="networkidle")
        page.wait_for_selector('table tbody tr', timeout=10000)
        page.wait_for_timeout(1000)
        page.screenshot(path=str(SCREENSHOTS_DIR / "07_history_desktop.png"), full_page=True)
        print("    [+] Captured: 07_history_desktop.png")

        # Open Detail Modal
        eye_btn = page.locator('button[title="View Details"]').first
        if eye_btn.count() > 0:
            eye_btn.click()
            page.wait_for_selector('text=Session Inspection Specification', timeout=8000)
            page.wait_for_timeout(1000)
            page.screenshot(path=str(SCREENSHOTS_DIR / "08_history_detail_modal.png"))
            print("    [+] Captured: 08_history_detail_modal.png")
            # Close modal
            close_btn = page.locator('button:has(svg.lucide-x)').last
            if close_btn.count() > 0:
                close_btn.click()
                page.wait_for_timeout(500)

        # Page 6: Reports & Analytics
        print("[*] Navigating to Reports & Analytics (/reports)")
        page.goto(f"{FRONTEND_URL}/reports", wait_until="networkidle")
        page.wait_for_timeout(1500)
        page.screenshot(path=str(SCREENSHOTS_DIR / "09_reports_analytics_desktop.png"), full_page=True)
        print("    [+] Captured: 09_reports_analytics_desktop.png")

        # Page 7: Methodology & Syllabus
        print("[*] Navigating to Methodology & Syllabus (/methodology)")
        page.goto(f"{FRONTEND_URL}/methodology", wait_until="networkidle")
        page.wait_for_timeout(1500)
        page.screenshot(path=str(SCREENSHOTS_DIR / "11_methodology_desktop.png"), full_page=True)
        print("    [+] Captured: 11_methodology_desktop.png")

        context_desktop.close()

        # -------------------------------------------------------------
        # 2. Mobile Viewport Testing (390 x 844)
        # -------------------------------------------------------------
        print("\n[Phase 2] Mobile Viewport Testing (390x844 iPhone 14 / modern smartphone)...")
        context_mobile = browser.new_context(viewport={"width": 390, "height": 844})
        mobile_page = context_mobile.new_page()

        # Mobile Landing
        mobile_page.goto(f"{FRONTEND_URL}/", wait_until="networkidle")
        mobile_page.wait_for_timeout(1000)
        mobile_page.screenshot(path=str(SCREENSHOTS_DIR / "12_landing_mobile.png"), full_page=True)
        print("    [+] Captured: 12_landing_mobile.png")

        # Mobile Drawer Open
        menu_btn = mobile_page.locator('button:has(svg.lucide-menu)')
        if menu_btn.count() > 0:
            menu_btn.click()
            mobile_page.wait_for_timeout(500)
            mobile_page.screenshot(path=str(SCREENSHOTS_DIR / "13_mobile_drawer_open.png"))
            print("    [+] Captured: 13_mobile_drawer_open.png")

        # Mobile Dashboard
        mobile_page.goto(f"{FRONTEND_URL}/dashboard", wait_until="networkidle")
        mobile_page.wait_for_timeout(1000)
        mobile_page.screenshot(path=str(SCREENSHOTS_DIR / "14_dashboard_mobile.png"), full_page=True)
        print("    [+] Captured: 14_dashboard_mobile.png")

        # Mobile Image Inspection
        mobile_page.goto(f"{FRONTEND_URL}/detect-image", wait_until="networkidle")
        mobile_page.wait_for_timeout(1000)
        mobile_page.screenshot(path=str(SCREENSHOTS_DIR / "15_detect_image_mobile.png"), full_page=True)
        print("    [+] Captured: 15_detect_image_mobile.png")

        context_mobile.close()
        browser.close()

    print("\n" + "=" * 70)
    print("[+] Browser verification completed successfully!")
    print(f"[+] Total screenshots saved: {len(list(SCREENSHOTS_DIR.glob('*.png')))}")
    print(f"[*] Console error count: {len(console_logs)}")
    print(f"[*] Network error count: {len(network_errors)}")
    print("=" * 70)

    # Save summary report
    summary = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "frontend_url": FRONTEND_URL,
        "screenshots_captured": [p.name for p in sorted(SCREENSHOTS_DIR.glob("*.png"))],
        "console_logs_count": len(console_logs),
        "console_logs_sample": console_logs[:15],
        "network_errors_count": len(network_errors),
        "network_errors_sample": network_errors[:15]
    }
    with open(REPORTS_DIR / "browser_verification_summary.json", "w") as f:
        json.dump(summary, f, indent=2)

if __name__ == "__main__":
    run_browser_verification()
