package org.example.hakyfoodbackend.modules.user.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.hakyfoodbackend.modules.user.entity.Permission;
import org.example.hakyfoodbackend.modules.user.entity.Role;
import org.example.hakyfoodbackend.modules.user.repository.PermissionRepository;
import org.example.hakyfoodbackend.modules.user.repository.RoleRepository;
import org.jspecify.annotations.NonNull;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class RbacDatabaseInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    @Override
    @Transactional
    public void run(String @NonNull ... args) {
        log.info("=== Starting RBAC database initialization... ===");

        Map<String, Permission> permissionMap = initializePermissions();

        initializeRoles(permissionMap);

        log.info("=== RBAC database initialization completed. ===");
    }

    private Map<String, Permission> initializePermissions() {
        List<PermissionInfo> permissionInfos = List.of(
                new PermissionInfo("role.manage", "Manage Roles", "Quyền quản lý vai trò trong hệ thống"),
                new PermissionInfo("permission.manage", "Manage Permissions", "Quyền quản lý quyền hạn trong hệ thống"),
                new PermissionInfo("category.manage", "Manage Category", "Quyền quản lý danh mục món ăn"),
                new PermissionInfo("food.manage", "Manage Food", "Quyền quản lý các món ăn")
        );

        Map<String, Permission> permissionMap = permissionRepository.findAll()
                .stream()
                .collect(Collectors.toMap(
                        Permission::getCode,
                        Function.identity()
                ));

        List<Permission> newPermissions = new ArrayList<>();

        for (PermissionInfo pi : permissionInfos) {
            if (!permissionMap.containsKey(pi.code)) {
                Permission permission = Permission.builder()
                        .code(pi.code)
                        .name(pi.name)
                        .description(pi.description)
                        .build();
                newPermissions.add(permission);
            }
        }

        if (!newPermissions.isEmpty()) {
            List<Permission> savedPermissions = permissionRepository.saveAll(newPermissions);

            savedPermissions.forEach(permission -> permissionMap.put(permission.getCode(), permission));
        }

        return permissionMap;
    }

    private void initializeRoles(Map<String, Permission> permissionMap) {
        List<RoleInfo> roleInfos = List.of(
                new RoleInfo(
                        "ADMIN",
                        "Quản trị viên",
                        "Quản trị hệ thống",
                        true,
                        Set.copyOf(permissionMap.keySet())
                ),
                new RoleInfo(
                        "OWNER",
                        "Chủ cửa hàng",
                        "Chủ cửa hàng",
                        true,
                        Set.of("category.manage", "food.manage")
                ),
                new RoleInfo(
                        "CUSTOMER",
                        "Khách hàng",
                        "Khách hàng mua đồ ăn trực tuyến",
                        true,
                        Collections.emptySet()
                )
        );

        Map<String, Role> existingRoles = roleRepository.findAll()
                .stream()
                .collect(Collectors.toMap(
                        Role::getCode,
                        Function.identity()
                ));

        List<Role> rolesToSave = new ArrayList<>();

        for (RoleInfo ri : roleInfos) {
            Role role = existingRoles.getOrDefault(ri.code, new Role(ri.code));

            role.setName(ri.name);
            role.setDescription(ri.description);
            role.setIsSystem(ri.isSystem);

            Set<Permission> permissions = ri.permissionCodes()
                    .stream()
                    .map(code -> {
                        Permission permission = permissionMap.get(code);
                        if (permission == null) {
                            throw new IllegalStateException("Permission not found: " + code);
                        }
                        return permission;
                    })
                    .collect(Collectors.toSet());

            role.setPermissions(permissions);

            rolesToSave.add(role);
        }

        roleRepository.saveAll(rolesToSave);
    }

    private record PermissionInfo(
            String code,
            String name,
            String description
    ) {}

    private record RoleInfo(
            String code,
            String name,
            String description,
            boolean isSystem,
            Set<String> permissionCodes
    ) {}

}
