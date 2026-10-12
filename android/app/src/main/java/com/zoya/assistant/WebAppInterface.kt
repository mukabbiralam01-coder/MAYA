package com.zoya.assistant

import android.content.Context
import android.content.Intent
import android.hardware.camera2.CameraAccessException
import android.hardware.camera2.CameraManager
import android.net.Uri
import android.os.BatteryManager
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.webkit.JavascriptInterface
import android.widget.Toast

class WebAppInterface(private val activity: MainActivity) {

    private val cameraManager = activity.getSystemService(Context.CAMERA_SERVICE) as? CameraManager
    private var cameraId: String? = null
    private var isTorchOn = false

    init {
        try {
            cameraId = cameraManager?.cameraIdList?.firstOrNull { id ->
                cameraManager.getCameraCharacteristics(id)
                    .get(android.hardware.camera2.CameraCharacteristics.FLASH_INFO_AVAILABLE) == true
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    @JavascriptInterface
    fun setTorch(enable: Boolean): Boolean {
        return try {
            cameraId?.let { id ->
                cameraManager?.setTorchMode(id, enable)
                isTorchOn = enable
                true
            } ?: false
        } catch (e: CameraAccessException) {
            e.printStackTrace()
            false
        }
    }

    @JavascriptInterface
    fun toggleTorch(): Boolean {
        return setTorch(!isTorchOn)
    }

    @JavascriptInterface
    fun isTorchActive(): Boolean = isTorchOn

    @JavascriptInterface
    fun vibrate(patternType: String) {
        val vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val vibratorManager = activity.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
            vibratorManager?.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            activity.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
        }

        if (vibrator == null || !vibrator.hasVibrator()) return

        when (patternType.lowercase()) {
            "double" -> {
                val timings = longArrayOf(0, 100, 80, 100)
                vibrator.vibrate(VibrationEffect.createWaveform(timings, -1))
            }
            "alarm", "intruder" -> {
                val timings = longArrayOf(0, 200, 100, 200, 100, 400)
                vibrator.vibrate(VibrationEffect.createWaveform(timings, -1))
            }
            "heartbeat" -> {
                val timings = longArrayOf(0, 80, 120, 80)
                vibrator.vibrate(VibrationEffect.createWaveform(timings, -1))
            }
            else -> {
                vibrator.vibrate(VibrationEffect.createOneShot(120, VibrationEffect.DEFAULT_AMPLITUDE))
            }
        }
    }

    @JavascriptInterface
    fun getBatteryLevel(): Int {
        val bm = activity.getSystemService(Context.BATTERY_SERVICE) as? BatteryManager
        return bm?.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY) ?: -1
    }

    @JavascriptInterface
    fun isBatteryCharging(): Boolean {
        val bm = activity.getSystemService(Context.BATTERY_SERVICE) as? BatteryManager
        val status = bm?.getIntProperty(BatteryManager.BATTERY_PROPERTY_STATUS)
        return status == BatteryManager.BATTERY_STATUS_CHARGING ||
                status == BatteryManager.BATTERY_STATUS_FULL
    }

    @JavascriptInterface
    fun armGuard(warning: String) {
        activity.runOnUiThread {
            activity.armMotionGuard(warning)
        }
    }

    @JavascriptInterface
    fun disarmGuard() {
        activity.runOnUiThread {
            activity.disarmMotionGuard()
        }
    }

    @JavascriptInterface
    fun setWakeLock(enable: Boolean) {
        activity.runOnUiThread {
            if (enable) {
                activity.window.addFlags(android.view.WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
            } else {
                activity.window.clearFlags(android.view.WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
            }
        }
    }

    @JavascriptInterface
    fun makePhoneCall(number: String) {
        try {
            val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:${number.trim()}"))
            activity.startActivity(intent)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    @JavascriptInterface
    fun openWhatsApp(number: String, message: String) {
        try {
            val url = "https://api.whatsapp.com/send?phone=${number.trim()}&text=${Uri.encode(message)}"
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
            activity.startActivity(intent)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    @JavascriptInterface
    fun showToast(msg: String) {
        activity.runOnUiThread {
            Toast.makeText(activity, msg, Toast.LENGTH_SHORT).show()
        }
    }
}
