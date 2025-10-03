import { useState } from "react"
import axios from "axios"
import API_BASE from '../lib/api_endpoint';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Check, X } from "lucide-react"
import { Link } from "react-router-dom"

const PlayerDetails = {
  name: "",
  email: "",
  phone: "",
  registrationNumber: "",
  institute: "",
  delegateId: "",
}

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    teamId: "",
    teamLeader: { ...PlayerDetails },
    player2: { ...PlayerDetails },
    password: "",
    confirmPassword: "",
  })

  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // ---------------- Password Strength ----------------
  const checkPasswordStrength = (password) => {
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    })
  }

  const handlePasswordChange = (password) => {
    setFormData({ ...formData, password })
    checkPasswordStrength(password)
  }

  const updatePlayerField = (player, field, value) => {
    setFormData({
      ...formData,
      [player]: {
        ...formData[player],
        [field]: value,
      },
    })
  }

  // ---------------- Submit Handler ----------------
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!")
      return
    }

    const strengthCount = Object.values(passwordStrength).filter(Boolean).length
    if (strengthCount < 4) {
      setError("Password must meet at least 4 strength requirements!")
      return
    }

    try {
      setLoading(true)
      const res = await axios.post(`${API_BASE}/users/register`, {
        teamId: formData.teamId,
        teamLeader: formData.teamLeader,
        player2: formData.player2,
        password: formData.password,
      })

      setSuccess(res.data.message || "Registration successful!")
      console.log("Registered User:", res.data)
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  // ---------------- Password Strength Component ----------------
  const PasswordStrengthIndicator = () => (
    <div className="strength-indicator mt-3 p-4 rounded-lg border-2 border-turquoise/30">
      <p className="text-sm font-semibold mb-3 text-shadow-horror" style={{ color: "#09D8C7" }}>
        Password Requirements:
      </p>
      <div className="space-y-2">
        {[
          { key: "length", text: "At least 8 characters" },
          { key: "uppercase", text: "One uppercase letter" },
          { key: "lowercase", text: "One lowercase letter" },
          { key: "number", text: "One number" },
          { key: "special", text: "One special character" },
        ].map(({ key, text }) => (
          <div key={key} className="flex items-center gap-3">
            {passwordStrength[key] ? (
              <Check size={18} style={{ color: "#09D8C7" }} />
            ) : (
              <X size={18} style={{ color: "#BD0927" }} />
            )}
            <span
              className="text-sm font-medium text-shadow-horror"
              style={{
                color: passwordStrength[key] ? "#09D8C7" : "#BD0927",
              }}
            >
              {text}
            </span>
          </div>
        ))}
      </div>
    </div>
  )

  // ---------------- Player Section ----------------
  const PlayerSection = ({ title, player, playerKey }) => (
    <div className="space-y-5">
      <h3 className="ancient-text text-xl font-bold text-shadow-strong" style={{ color: "#09D8C7" }}>
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {["name", "email", "phone", "registrationNumber", "institute", "delegateId"].map((field) => (
          <div key={field}>
            <Label
              className="font-semibold text-sm text-shadow-horror"
              style={{ color: "#09D8C7" }}
            >
              {field.charAt(0).toUpperCase() + field.slice(1)} *
            </Label>
            <Input
              type={field === "email" ? "email" : field === "phone" ? "tel" : "text"}
              value={player[field]}
              onChange={(e) => updatePlayerField(playerKey, field, e.target.value)}
              required
              className="mystical-input mt-2 bg-transparent border-2 text-shadow-horror"
              style={{ borderColor: "#17364F", color: "#09D8C7" }}
            />
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <Card className="mystical-form backdrop-blur-md border-2">
      <CardHeader className="text-center space-y-4">
        <CardTitle className="ancient-text text-3xl font-bold text-shadow-strong">
          Team Registration
        </CardTitle>
        <p className="text-sm text-shadow-horror" style={{ color: "#09D8C7" }}>
          Assemble your champions for the ultimate challenge
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Team ID */}
          <div>
            <Label
              htmlFor="teamId"
              className="font-semibold text-sm text-shadow-horror"
              style={{ color: "#09D8C7" }}
            >
              Team ID *
            </Label>
            <Input
              id="teamId"
              value={formData.teamId}
              onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
              required
              className="mystical-input mt-2 bg-transparent border-2 text-shadow-horror"
              style={{ borderColor: "#17364F", color: "#09D8C7" }}
            />
          </div>

          {/* Team Leader & Player2 */}
          <PlayerSection title="Team Leader Details" player={formData.teamLeader} playerKey="teamLeader" />
          <PlayerSection title="Player 2 Details" player={formData.player2} playerKey="player2" />

          {/* Passwords */}
          <div className="space-y-5">
            <div>
              <Label htmlFor="password" className="font-semibold text-sm text-shadow-horror" style={{ color: "#09D8C7" }}>
                Password *
              </Label>
              <div className="relative mt-2">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  required
                  className="mystical-input bg-transparent border-2 pr-10 text-shadow-horror"
                  style={{ borderColor: "#17364F", color: "#09D8C7" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:scale-110 transition-transform text-shadow-horror"
                  style={{ color: "#09D8C7" }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formData.password && <PasswordStrengthIndicator />}
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="font-semibold text-sm text-shadow-horror" style={{ color: "#09D8C7" }}>
                Confirm Password *
              </Label>
              <div className="relative mt-2">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  className="mystical-input bg-transparent border-2 pr-10 text-shadow-horror"
                  style={{
                    borderColor:
                      formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? "#BD0927"
                        : "#17364F",
                    color: "#09D8C7",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:scale-110 transition-transform text-shadow-horror"
                  style={{ color: "#09D8C7" }}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-sm mt-2 font-medium text-shadow-horror" style={{ color: "#BD0927" }}>
                  Passwords do not match
                </p>
              )}
            </div>
          </div>

          {/* Error / Success Messages */}
          {error && <p className="text-red-500 font-semibold">{error}</p>}
          {success && <p className="text-green-500 font-semibold">{success}</p>}

          {/* Submit */}
          <Button
            type="submit"
            className="horror-button w-full font-bold text-lg text-shadow-horror"
            disabled={loading}
          >
            {loading ? "Registering..." : <span className="ancient-text">Join the Opus</span>}
          </Button>

          <div className="text-center text-shadow-horror">
            <span className="font-medium" style={{ color: "#09D8C7" }}>
              Already have a team?{" "}
            </span>
            <Link
              to="/login"
              className="underline font-bold hover:scale-105 transition-transform text-shadow-horror"
              style={{ color: "#BD0927" }}
            >
              Login here
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
