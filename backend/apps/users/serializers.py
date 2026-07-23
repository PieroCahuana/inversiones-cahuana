from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "phone",
            "role",
            "is_verified",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "username",
            "email",
            "role",
            "is_verified",
            "created_at",
            "updated_at",
        )

    def get_full_name(self, obj) -> str:
        return obj.get_full_name()


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
    )
    password_confirm = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
    )

    class Meta:
        model = User
        fields = (
            "email",
            "first_name",
            "last_name",
            "phone",
            "password",
            "password_confirm",
        )

    def validate_email(self, value: str) -> str:
        email = value.strip().lower()

        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError(
                "Ya existe una cuenta registrada con este correo."
            )

        return email

    def validate(self, attrs: dict) -> dict:
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {"password_confirm": "Las contraseñas no coinciden."}
            )

        return attrs

    def create(self, validated_data: dict):
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")
        email = validated_data["email"]

        username = self._generate_unique_username(email)

        user = User(
            username=username,
            role=User.Role.CUSTOMER,
            is_verified=False,
            **validated_data,
        )
        user.set_password(password)
        user.save()

        return user

    @staticmethod
    def _generate_unique_username(email: str) -> str:
        base_username = email.split("@")[0]
        username = base_username
        counter = 1

        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        return username
    
class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "first_name",
            "last_name",
            "phone",
        )

    def validate_first_name(self, value: str) -> str:
        return value.strip()

    def validate_last_name(self, value: str) -> str:
        return value.strip()

    def validate_phone(self, value: str) -> str:
        phone = value.strip()

        if phone and not phone.isdigit():
            raise serializers.ValidationError(
                "El teléfono solo debe contener números."
            )

        if phone and len(phone) != 9:
            raise serializers.ValidationError(
                "El teléfono debe contener 9 dígitos."
            )

        return phone


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)

    def validate(self, attrs: dict) -> dict:
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {"password_confirm": "Las contraseñas no coinciden."}
            )
        validate_password(attrs["password"])
        return attrs


class AdminUserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    orders_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = (
            "id", "username", "email", "first_name", "last_name",
            "full_name", "phone", "role", "is_verified", "is_active",
            "orders_count", "last_login", "created_at", "updated_at",
        )
        read_only_fields = (
            "id", "username", "email", "first_name", "last_name",
            "full_name", "phone", "orders_count", "last_login",
            "created_at", "updated_at",
        )

    def get_full_name(self, obj) -> str:
        return obj.get_full_name()

    def validate(self, attrs: dict) -> dict:
        request = self.context.get("request")
        if request and self.instance == request.user:
            if attrs.get("is_active") is False:
                raise serializers.ValidationError(
                    {"is_active": "No puedes desactivar tu propia cuenta."}
                )
            if attrs.get("role") and attrs["role"] != User.Role.ADMIN:
                raise serializers.ValidationError(
                    {"role": "No puedes retirar tu propio rol de administrador."}
                )
        return attrs
