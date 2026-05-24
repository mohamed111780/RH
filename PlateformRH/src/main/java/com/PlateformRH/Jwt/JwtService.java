package com.PlateformRH.Jwt;

import com.PlateformRH.Utilisateur.UtilisateurServiceImpl;
import com.PlateformRH.Utilisateur.utilisateur;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@AllArgsConstructor
@Getter
@Service
@Transactional
public class JwtService {
    private final String ENCRIPTION_KEY = "608f36e92dc66d97d5933f0e6371493cb4fc05b1aa8f8de64014732472303a7c";
    private UtilisateurServiceImpl userService;
    private JwtRepository jwtRepository;

    public Jwt tokenByValeur(String valeur) {
        return jwtRepository.findByValue(valeur)
                .orElseThrow(() -> new RuntimeException("no token"));
    }

    public Map<String, String> generate(String username) {
        utilisateur utilisateur = userService.loadUserByUsername(username);
        this.disableTokens(utilisateur);
        final Map<String, String> jwtMap = generateJwt(utilisateur);
        final Jwt jwt = Jwt.builder()
                .desactivated(false)
                .expired(false)
                .value(jwtMap.get("accessToken"))  // << maintenant c’est accessToken
                .user(utilisateur)
                .build();
        jwtRepository.save(jwt);

        return jwtMap;
    }


    public void disableTokens(utilisateur utilisateur) {
        final List<Jwt> jwtList = jwtRepository.findTokensByUserEmail(utilisateur.getEmail()).map(
                jwt -> {
                    jwt.setDesactivated(true);
                    jwt.setExpired(true);
                    return jwt;
                }

        ).collect(Collectors.toList());
        jwtRepository.saveAll(jwtList);
    }

    public Map<String, String> generateJwt(utilisateur utilisateur) {
        final long currentTime = System.currentTimeMillis();
        final long accessExpiration = currentTime + (300 * 60 * 1000); // 300 minutes  5h
        final long refreshExpiration = currentTime + (24 * 60 * 60 * 1000); // 24 heures

        // Création Access Token
        final String accessToken = Jwts.builder()
                .setIssuedAt(new Date(currentTime))
                .setExpiration(new Date(accessExpiration))
                .setSubject(utilisateur.getEmail())
                .addClaims(Map.of(
                        "nom", utilisateur.getNom(),
                        "type", "access"
                ))
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();

        // Création Refresh Token
        final String refreshToken = Jwts.builder()
                .setIssuedAt(new Date(currentTime))
                .setExpiration(new Date(refreshExpiration))
                .setSubject(utilisateur.getEmail())
                .addClaims(Map.of(
                        "nom", utilisateur.getNom(),
                        "type", "refresh"
                ))
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();

        return Map.of(
                "accessToken", accessToken,
                "refreshToken", refreshToken
        );
    }


    public Key getKey() {
        final byte[] decoder = Decoders.BASE64.decode(ENCRIPTION_KEY);
        return Keys.hmacShaKeyFor(decoder);
    }

    public Date getExpirationDateFromToken(String token) {
        return this.getClaim(token, Claims::getExpiration);
    }

    public boolean isTokenExpired(String token) {
        Date expirationDate = getExpirationDateFromToken(token);
        return expirationDate.before(new Date());
    }

    public  <T> T getClaim(String token, Function<Claims, T> function) {
        Claims claims = getAllClaims(token);
        return function.apply(claims);
    }

    public Claims getAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(this.getKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String extractUsername(String token) {
        return this.getClaim(token, Claims::getSubject);
    }

    public void deconnexion(){
        utilisateur utilisateur = (utilisateur) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        Jwt jwt = jwtRepository.findValidToken(utilisateur.getEmail(), false, false)
                .orElseThrow(() -> new RuntimeException("Token invalide"));

        jwt.setDesactivated(true);
        jwt.setExpired(true);
        jwtRepository.save(jwt);


    }

    // @Scheduled(cron = "@daily")
    // @Scheduled(cron = "0 */5 * * * * ")
    //public void removeUselessTokens(){
    //  log.info("Supprission des Tokens à {}", Instant.now());
    //jwtRepository.deleteAllByExpiredAndDesactivated(true,true);
    //}


    //  AJOUTÉ pour vérifier si c'est un Refresh Token :
    public boolean isRefreshToken(String token) {
        String type = getClaim(token, claims -> claims.get("type", String.class));
        return "refresh".equals(type);
    }
}
