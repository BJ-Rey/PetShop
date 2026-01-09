package com.tencent.wxcloudrun.controller;

import com.tencent.wxcloudrun.config.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.io.IOException;
import java.util.UUID;

@RestController
public class UploadController {

    private final Logger logger = LoggerFactory.getLogger(UploadController.class);

    @PostMapping(value = "/api/upload")
    public ApiResponse upload(@RequestParam("file") MultipartFile file, HttpServletRequest request) {
        if (file.isEmpty()) {
            return ApiResponse.error("文件为空");
        }

        try {
            // 获取文件名
            String originalFilename = file.getOriginalFilename();
            // 获取文件后缀
            String suffixName = originalFilename.substring(originalFilename.lastIndexOf("."));
            // 生成新文件名
            String fileName = UUID.randomUUID() + suffixName;
            
            // 获取当前工作目录
            String currentPath = System.getProperty("user.dir");
            File dest = new File(currentPath + File.separator + "uploads" + File.separator + fileName);
            
            // 检测目录是否存在
            if (!dest.getParentFile().exists()) {
                dest.getParentFile().mkdirs();
            }
            
            // 保存文件
            file.transferTo(dest);
            
            // 构建返回的URL
            // 注意：这里假设服务运行在本地或可以通过相对路径访问
            // 在实际生产环境中，应该返回完整的域名+路径
            String scheme = request.getScheme();
            String serverName = request.getServerName();
            int serverPort = request.getServerPort();
            // String url = scheme + "://" + serverName + ":" + serverPort + "/uploads/" + fileName;
            
            // 为了方便小程序访问，这里我们返回相对路径，或者根据配置返回完整路径
            // 考虑到小程序可能需要完整路径，这里尽量构建完整路径
            // 如果是在容器中，serverName可能是localhost，需要前端配合替换base url
            String url = "/uploads/" + fileName;
            
            return ApiResponse.ok(url);
        } catch (IOException e) {
            logger.error("文件上传失败", e);
            return ApiResponse.error("文件上传失败");
        }
    }
}
